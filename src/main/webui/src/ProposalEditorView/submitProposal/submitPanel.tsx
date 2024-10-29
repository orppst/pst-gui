import {ReactElement, SyntheticEvent, useEffect, useState} from "react";
import {Grid, Select, Stack, Text} from "@mantine/core";
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
import ValidationOverview from "../proposal/ValidationOverview.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

function SubmitPanel(): ReactElement {

    const {selectedProposalCode} = useParams();

    const navigate = useNavigate();

    const [cyclesData, setCyclesData] = useState<{value: string, label: string}[]>([]);

    const [selectedCycle , setSelectedCycle] = useState(0);

    const [submissionDeadline, setSubmissionDeadline] = useState("undefined");

    const [isValid, setIsValid] = useState(false);

    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            selectedCycle: 0,
        },
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



    const changeCycleDates = (value: string | null) => {
        fetchProposalCyclesResourceGetProposalCycleDates(
            {pathParams: {cycleCode: Number(value)}})
            .then((dates) => {
                setSubmissionDeadline(dates.submissionDeadline!);
                console.log(dates)
            })
            .catch(console.log)

        form.values.selectedCycle = Number(value);
        setSelectedCycle(Number(value));
    }


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

            <ValidationOverview cycle={selectedCycle} setValid={setIsValid}/>

            <form onSubmit={trySubmitProposal}>
                <ContextualHelpButton messageId="ManageSubmit" />
                <Stack>
                    <Select label={"Cycle"}
                        data={cyclesData}
                        {...form.getInputProps("selectedCycle")}
                        onChange={changeCycleDates}
                    />

                    <Text>Submission deadline {submissionDeadline}</Text>
                </Stack>

                <p> </p>
                <Grid>
                    <Grid.Col span={8}></Grid.Col>
                    <SubmitButton
                        disabled={form.values.selectedCycle===0 || !isValid}
                        label={"Submit proposal"}
                        toolTipLabel={"Submit your proposal to the selected cycle"}
                    />
                    <CancelButton
                        onClickEvent={handleCancel}
                        toolTipLabel={"Go back without submitting"}/>
                </Grid>

            </form>
        </PanelFrame>
    )
}

export default SubmitPanel