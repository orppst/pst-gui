import {ReactElement, useEffect, useState} from "react";
import {Select, Stack, Text} from "@mantine/core";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceGetProposalCycleObservatory,
    fetchProposalCyclesResourceReplaceCycleObservatory, ProposalCyclesResourceReplaceCycleObservatoryVariables,
    useObservatoryResourceGetObservatories
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "../../commonButtons/save.tsx";

export default function CycleObservatoryPanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const [observatorySearchData, setSearchData] = useState([]);
    const [formReady, setFormReady] = useState(false);
    const form = useForm({
        initialValues: {selectedObservatory: 0},
        validate: {
            selectedObservatory: (value) => (
                value === 0 || value === null ? 'Please select an observatory' : null)
        }
    });

    const observatories = useObservatoryResourceGetObservatories({});

    if(observatories.error) {
        notifyError("Failed to load list of observatories",
            getErrorMessage(observatories.error));
    }

    useEffect(() => {
        if(observatories.status === 'success') {
            setSearchData([]);
            observatories.data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {
                    value: String(item.dbid), label: item.name}])
            ));

            fetchProposalCyclesResourceGetProposalCycleObservatory(
                {pathParams: {cycleCode: Number(selectedCycleCode)}})
                .then((observatory) => {
                    //FIXME: None of these three ways to set the default value seem to work
                    form.values.selectedObservatory = Number(observatory?._id);
                    //form.setFieldValue('selectedObservatory', Number(observatory?._id));
                    //form.setInitialValues({selectedObservatory: Number(observatory?._id)});
                    setFormReady(true);
                })
                .catch((error) => {
                    console.error(error);
                    notifyError("Failed to load proposal cycle details",
                        getErrorMessage(error))
                })

        }
    }, [observatories.status, observatories.data]);

    const updateObservatory = form.onSubmit((val) => {
        form.validate();
        const newObservatory: ProposalCyclesResourceReplaceCycleObservatoryVariables =
                {
                    pathParams: {cycleCode: Number(selectedCycleCode)},
                    body: Number(val.selectedObservatory),
                    // @ts-ignore
                    headers: {"Content-Type": "text/plain"}
                };

        fetchProposalCyclesResourceReplaceCycleObservatory(newObservatory)
            .then(()=> {
                    notifySuccess("Update observatory", "Changes saved");
                    form.resetDirty();
                }
            )
            .catch((error) => {
                notifyError("Error updating observatory", "Cause: "
                    + getErrorMessage(error))
            })
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