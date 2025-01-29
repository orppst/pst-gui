import {ReactElement, useEffect, useState} from "react";
import {Select, Stack, Text} from "@mantine/core";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {
    ProposalCyclesResourceReplaceCycleObservatoryVariables,
    useObservatoryResourceGetObservatories,
    useProposalCyclesResourceGetProposalCycleObservatory,
    useProposalCyclesResourceReplaceCycleObservatory
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {useQueryClient} from "@tanstack/react-query";

export default function CycleObservatoryPanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const [observatorySearchData, setSearchData] = useState([]);
    const [formReady, setFormReady] = useState(false);
    const queryClient = useQueryClient();
    const form = useForm({
        initialValues: {selectedObservatory: "0"},
        validate: {
            selectedObservatory: (value) => (
                value === "0" || value === null ? 'Please select an observatory' : null)
        }
    });

    const observatories = useObservatoryResourceGetObservatories({});

    if(observatories.error) {
        notifyError("Failed to load list of observatories",
            getErrorMessage(observatories.error));
    }

    const cycleObservatory
        = useProposalCyclesResourceGetProposalCycleObservatory({
            pathParams: {
                cycleCode: Number(selectedCycleCode)
            }
        });

    useEffect(() => {
        if(observatories.status === 'success') {
            setSearchData([]);
            observatories.data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {
                    value: String(item.dbid), label: item.name}])
            ));
        }
    }, [observatories.status, observatories.data]);

    useEffect(() => {
        if(cycleObservatory.error) {
            notifyError("Failed to load proposal cycle details",
                getErrorMessage(cycleObservatory.error));
        } else if(cycleObservatory.data !== undefined) {
            form.values.selectedObservatory = String(cycleObservatory.data!._id);
            setFormReady(true);
        }

    }, [cycleObservatory.status, cycleObservatory.data]);

    const replaceObservatoryMutation = useProposalCyclesResourceReplaceCycleObservatory({
        onSuccess: () => {
            notifySuccess("Update observatory", "Changes saved");
            form.resetDirty();
            queryClient.invalidateQueries(cycleObservatory).finally();
        },
        onError: (error) => {
            notifyError("Error updating observatory", "Cause: "
                + getErrorMessage(error))
        }
    });

    const updateObservatory = form.onSubmit((val) => {
        form.validate();
        const newObservatory: ProposalCyclesResourceReplaceCycleObservatoryVariables =
                {
                    pathParams: {cycleCode: Number(selectedCycleCode)},
                    body: Number(val.selectedObservatory),
                    // @ts-ignore
                    headers: {"Content-Type": "text/plain"}
                };

        replaceObservatoryMutation.mutate(newObservatory);
    })

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Observatory"} />
            <Text>Select the observatory used for this cycle</Text>

            {formReady && (
            <form onSubmit={updateObservatory}>
                <Stack>
                    <Select
                        data = {observatorySearchData}
                        allowDeselect={false}
                        {...form.getInputProps("selectedObservatory")}
                    />
                    <FormSubmitButton form={form} label={"Change observatory"}/>
                </Stack>
            </form>)}
        </PanelFrame>
    )
}