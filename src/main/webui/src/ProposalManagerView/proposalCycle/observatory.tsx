import {ReactElement, useEffect, useState} from "react";
import {Select, Text} from "@mantine/core";
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
import {SubmitButton} from "../../commonButtons/save.tsx";

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
            console.log("Got list of " + observatories.data.length + " observatories");
            setSearchData([]);
            observatories.data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {
                    value: String(item.dbid), label: item.name}])
            ));

            fetchProposalCyclesResourceGetProposalCycleObservatory(
                {pathParams: {cycleCode: Number(selectedCycleCode)}})
                .then((observatory) => {
                    form.values.selectedObservatory = Number(observatory?._id);
                    setFormReady(true);
                })
                .catch((error) => notifyError("Failed to load proposal cycle details",
                    getErrorMessage(error)))

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

        console.log(JSON.stringify(newObservatory,null,2));

        fetchProposalCyclesResourceReplaceCycleObservatory(newObservatory)
            .then(()=>
                notifySuccess("Update observatory", "Changes saved")
            )
            .catch((error) => {
                notifyError("Error updating observatory", "Cause: "+getErrorMessage(error))
            })
    })

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Observatory"} />
            <Text>WIP: this is where you view/edit the observatory used for the cycle</Text>

            {formReady && (
            <form onSubmit={updateObservatory}>
                <Select
                    searchable
                    data = {observatorySearchData}
                    {...form.getInputProps("observatory")}
                />
                <SubmitButton toolTipLabel={"Change observatory"}
                              disabled={!form.isDirty() || !form.isValid()}
                              />
            </form>)}

        </PanelFrame>
    )
}