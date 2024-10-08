import {SyntheticEvent, useState, useEffect} from "react";
import {
    fetchProposalResourceReplaceSummary,
    ProposalResourceReplaceSummaryVariables,
    useProposalResourceGetObservingProposal,
} from "src/generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useNavigate, useParams} from "react-router-dom";
import {Box, Grid, Stack, Textarea} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from 'src/commonButtons/save';
import CancelButton from "src/commonButtons/cancel.tsx";
import {
    JSON_SPACES,
    MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS
} from 'src/constants';
import MaxCharsForInputRemaining from "src/commonInputs/remainingCharacterCount.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";

function SummaryPanel() {
    const { selectedProposalCode } = useParams();
    const { data, error, isLoading, status} =
        useProposalResourceGetObservingProposal(
            {pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true});
    const [summary, setSummary] = useState( "");
    const [submitting, setSubmitting] = useState(false);
    const form = useForm({
        initialValues: {summary: "Loading..."},
        validate: {
            summary: (value) => (
                value.length < 1 ? 'Your summary cannot be empty' : null)
        }
    });

    // get client for talking to database.
    const queryClient = useQueryClient()

    const navigate = useNavigate();
    function handleCancel(event: SyntheticEvent) {
       event.preventDefault();
       navigate("../",{relative:"path"})
       }

    const mutation = useMutation({
            mutationFn: () => {
                const newSummary: ProposalResourceReplaceSummaryVariables = {
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    body: summary,
                    // @ts-ignore
                    headers: {"Content-Type": "text/plain"}
                }
                return fetchProposalResourceReplaceSummary(newSummary);
            },
            onMutate: () => {
                setSubmitting(true);
            },
            onError: () => {
                console.error("An error occurred trying to update the title");
                notifyError("Update failed", getErrorMessage(error))
            },
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() => setSubmitting(false));
                notifySuccess("Update summary", "Update successful");
                form.resetDirty();
            }
        }
    );

    useEffect(() => {
        if (status === 'success') {
            setSummary(data.summary as string);
            form.values.summary = data.summary as string;
        }
    }, [status, data]);


    if (error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const updateSummary = form.onSubmit((val) => {
        form.validate();
        setSummary(val.summary);
        mutation.mutate();
    });
    return (
        <PanelFrame>
            <PanelHeader isLoading={isLoading} itemName={data?.title as string} panelHeading={"Summary"} />
            {isLoading ? <Box>loading...</Box>:
              submitting ?
                <Box>Submitting request</Box> :

            <form onSubmit={updateSummary}>
                    <ContextualHelpButton messageId="MaintSum" />
                <Stack>
                    <Textarea rows={TEXTAREA_MAX_ROWS}
                              maxLength={MAX_CHARS_FOR_INPUTS}
                              name="summary" {...form.getInputProps('summary')} />
                    <MaxCharsForInputRemaining length={form.values.summary.length} />
                </Stack>
                <p> </p>
                <Grid >
                   <Grid.Col span={9}></Grid.Col>
                       <FormSubmitButton form={form} />
                       <CancelButton
                            onClickEvent={handleCancel}
                            toolTipLabel={"Go back without saving"}/>
                </Grid>
                <p> </p>
            </form>
            }
        </PanelFrame>
    );

}

export default SummaryPanel