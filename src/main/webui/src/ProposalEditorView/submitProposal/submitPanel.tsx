import {ReactElement, SyntheticEvent, useEffect, useState} from "react";
import {Group, Select, Space, Stack} from "@mantine/core";
import {
    fetchProposalCyclesResourceGetProposalCycleDates, fetchProposalCyclesResourceGetProposalCycles,
    fetchSubmittedProposalResourceSubmitProposal,
    SubmittedProposalResourceSubmitProposalVariables
} from "src/generated/proposalToolComponents.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useForm} from "@mantine/form";
import {SubmitButton} from "src/commonButtons/save.tsx";
import CancelButton from "src/commonButtons/cancel.tsx";
import {useQueryClient} from "@tanstack/react-query";
import ValidationOverview from "./ValidationOverview.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

function SubmitPanel(): ReactElement {

    const {selectedProposalCode} = useParams();

    const navigate = useNavigate();

    const [cyclesData, setCyclesData] = useState<{value: string, label: string}[]>([]);

    const [submissionDeadline, setSubmissionDeadline] = useState("");

    const [isProposalReady, setIsProposalReady] = useState(false);

    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            selectedCycle: 0,
        },
        validate: {
            selectedCycle: (value) =>
                (value === 0 ? 'Please select a cycle' : null)
        }
    });

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


    useEffect(() => {
        if (form.getValues().selectedCycle > 0) {
            fetchProposalCyclesResourceGetProposalCycleDates(
                {pathParams: {cycleCode: Number(form.getValues().selectedCycle)}})
                .then((dates) => {
                    setSubmissionDeadline(dates.submissionDeadline!);
                })
                .catch((error) => {
                    notifyError("Failed to load proposal cycle dates", getErrorMessage(error))
                })
        }
        //else do nothing
    }, [form.getValues().selectedCycle]);


    const trySubmitProposal = form.onSubmit(() => {
        const submissionVariables: SubmittedProposalResourceSubmitProposalVariables = {
            pathParams: {cycleCode: Number(form.values.selectedCycle)},
            body: {
                proposalId: Number(selectedProposalCode),
                config: [] //FIXME need to create gui to fill the observation->observationMode mapping.
            },
            // @ts-ignore
            headers: {"Content-Type": "text/plain"}
        };

        fetchSubmittedProposalResourceSubmitProposal(submissionVariables)
            .then(()=> {
                notifySuccess("Submission", "Your proposal has been submitted");
                queryClient.invalidateQueries().then();
                navigate("/proposal/" + selectedProposalCode);
            })
            .catch((error) => notifyError("Submission failed", getErrorMessage(error))
            )
    });
  function handleCancel(event: SyntheticEvent) {
      event.preventDefault();
      navigate("../",{relative:"path"})
      }

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Submit"} />

            <ValidationOverview cycle={form.getValues().selectedCycle} setValid={setIsProposalReady}/>

            <form onSubmit={trySubmitProposal}>
                <ContextualHelpButton messageId="ManageSubmit" />
                <Stack>
                    <Select
                        label={"Please select a proposal cycle"}
                        description={submissionDeadline === "" ?
                            "Submission deadline: " : "Submission deadline: "+ submissionDeadline}
                        data={cyclesData}
                        {...form.getInputProps("selectedCycle")}
                    />
                </Stack>

                <Space h={"xl"}/>

                <Group justify={'flex-end'}>
                    <SubmitButton
                        disabled={!form.isValid() || !isProposalReady}
                        label={"Submit proposal"}
                        toolTipLabel={"Submit your proposal to the selected cycle"}
                    />
                    <CancelButton
                        onClickEvent={handleCancel}
                        toolTipLabel={"Go back without submitting"}/>
                </Group>

            </form>
        </PanelFrame>
    )
}

export default SubmitPanel