import {ReactElement, SyntheticEvent, useEffect, useState} from "react";
import {Group, Select, Stack} from "@mantine/core";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import CancelButton from "../../commonButtons/cancel.tsx";
import {
    fetchProposalCyclesResourceGetProposalCycleDates,
    fetchProposalCyclesResourceGetProposalCycles,
    fetchSubmittedProposalResourceSubmitProposal,
    SubmittedProposalResourceSubmitProposalVariables
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {UseFormReturnType} from "@mantine/form";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {SubmissionFormValues} from "./submitPanel.tsx";

export default
function SubmissionForm(props: {form: UseFormReturnType<SubmissionFormValues>, isProposalReady: boolean}) :
    ReactElement {

    const {selectedProposalCode} = useParams();

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const [cyclesData, setCyclesData] = useState<{value: string, label: string}[]>([]);

    const [submissionDeadline, setSubmissionDeadline] = useState("");

    useEffect(() => {
        fetchProposalCyclesResourceGetProposalCycles({
            queryParams: {includeClosed: false}
        })
            .then((data: ObjectIdentifier[])=> {
                setCyclesData(
                    data?.map((cycle) =>(
                        {value: String(cycle.dbid), label: cycle.name!}
                    ))
                )
            })
            .catch((error) => {
                notifyError("Loading Proposal Cycles failed", getErrorMessage(error))
            })
    }, []);


    //irritatingly we have to fetch ProposalCycleDates separately --
    // -- perhaps we need a "CycleSynopsis" cf. "ProposalSynopsis"?
    useEffect(() => {
        if (props.form.getValues().selectedCycle > 0) {
            fetchProposalCyclesResourceGetProposalCycleDates(
                {pathParams: {cycleCode: Number(props.form.getValues().selectedCycle)}})
                .then((dates) => {
                    setSubmissionDeadline(dates.submissionDeadline!);
                })
                .catch((error) => {
                    notifyError("Failed to load proposal cycle dates", getErrorMessage(error))
                })
        }
        //else do nothing
    }, [props.form.getValues().selectedCycle]);

    const trySubmitProposal = props.form.onSubmit(() => {
        const submissionVariables: SubmittedProposalResourceSubmitProposalVariables = {
            pathParams: {cycleCode: Number(props.form.values.selectedCycle)},
            body: {
                proposalId: Number(selectedProposalCode),
                config: [] //FIXME need to create gui to fill the observation->observationMode mapping.
            },
            // @ts-ignore
            headers: {"Content-Type": "text/plain"}
        };

        fetchSubmittedProposalResourceSubmitProposal(submissionVariables)
            .then(()=> {
                notifySuccess("Submission successful", "Your proposal has been submitted");
                queryClient.invalidateQueries().then();
                navigate("/proposal/" + selectedProposalCode);
            })
            .catch((error) => notifyError("Submission failed", getErrorMessage(error))
            )
    });

    const handleCancel = (event: SyntheticEvent)=> {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
        <form onSubmit={trySubmitProposal}>
            <Stack>
                <Group>
                    <ContextualHelpButton messageId="ManageSubmit"/>
                </Group>
                <Select
                    label={"Please select a proposal cycle"}
                    description={submissionDeadline === "" ?
                        "Submission deadline: " : "Submission deadline: " + submissionDeadline}
                    data={cyclesData}
                    {...props.form.getInputProps("selectedCycle")}
                />
                <Group justify={'flex-end'}>
                    <SubmitButton
                        disabled={!props.form.isValid() || !props.isProposalReady}
                        label={"Submit proposal"}
                        toolTipLabel={"Submit your proposal to the selected cycle"}
                    />
                    <CancelButton
                        onClickEvent={handleCancel}
                        toolTipLabel={"Go back without submitting"}/>
                </Group>
            </Stack>
        </form>
    )
}