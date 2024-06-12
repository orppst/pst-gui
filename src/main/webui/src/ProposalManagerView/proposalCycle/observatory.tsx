import {ReactElement, useEffect, useState} from "react";
import {Select, Text} from "@mantine/core";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceGetProposalCycle,
    fetchProposalCyclesResourceGetProposalCycleObservatory,
    fetchProposalCyclesResourceReplaceCycleObservatory, ProposalCyclesResourceReplaceCycleObservatoryVariables,
    useObservatoryResourceGetObservatories
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useForm} from "@mantine/form";
import {SubmitButton} from "../../commonButtons/save.tsx";

export default function CycleObservatoryPanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const [observatorySearchData, setSearchData] = useState([]);
    const [formReady, setFormReady] = useState(false);
    let defaultObservatory = "";
    const form = useForm({
        initialValues: {selectedObservatory: 0},
        validate: {
            selectedObservatory: (value) => (
                value === 0 ? 'Please select an observatory' : null)
        }
    });

    const observatories = useObservatoryResourceGetObservatories({});
/*    const proposalCycle = useProposalCyclesResourceGetProposalCycle({pathParams: {cycleCode: Number(selectedCycleCode)}});

    if(proposalCycle.error) {
        notifyError("Failed to load proposal cycle details",
            getErrorMessage(proposalCycle.error));
    }
*/
    if(observatories.error) {
        notifyError("Failed to load list of observatories",
            getErrorMessage(observatories.error));
    }
/*
    useEffect(() => {
            if(proposalCycle.status === 'success') {
                console.log("Observatory is " + proposalCycle.data.observatory?.name);
                form.values.selectedObservatory = Number(proposalCycle.data.observatory?._id);
            }
        }, [proposalCycle.status, proposalCycle.data]);
*/
    useEffect(() => {
        if(observatories.status === 'success') {
            console.log("Got list of " + observatories.data.length + " observatories");
            setSearchData([]);
            observatories.data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {
                    value: String(item.dbid), label: item.name}])
            ));

            fetchProposalCyclesResourceGetProposalCycle({pathParams: {cycleCode: Number(selectedCycleCode)}})
                .then((data) => {
                    form.values.selectedObservatory = Number(data.observatory?._id);
                    defaultObservatory = data.observatory?.name!;
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

        fetchProposalCyclesResourceReplaceCycleObservatory(newObservatory)
            .then()
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
                    data = {observatorySearchData}
                    defaultValue = {3}
                    {...form.getInputProps('observatory')}
                />
                <SubmitButton toolTipLabel={"Change observatory"}
                              disabled={!form.isDirty() || !form.isValid()}
                              />
            </form>)}

        </PanelFrame>
    )
}


