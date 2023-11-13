import {useState, useEffect} from "react";
import {
    fetchProposalResourceReplaceSummary,
    ProposalResourceReplaceSummaryVariables,
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {useParams} from "react-router-dom";
import {Box, Text, Textarea} from "@mantine/core";
import {useForm} from "@mantine/form";
import { SubmitButton } from '../commonButtons/save.tsx';
import {
    HEADER_FONT_WEIGHT,
    JSON_SPACES,
    MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS
} from '../constants.tsx';

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
                console.log("An error occurred trying to update the title")
            },
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() => setSubmitting(false))
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
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const updateSummary = form.onSubmit((val) => {
        form.validate();
        setSummary(val.summary);
        mutation.mutate();
    });

    return (
        <Box>
            <Text fz="lg" fw={HEADER_FONT_WEIGHT}>Update summary</Text>
            {isLoading ? <Box>loading...</Box>:
              submitting ?
                <Box>Submitting request</Box> :

            <form onSubmit={updateSummary}>
                <Textarea rows={TEXTAREA_MAX_ROWS}
                          maxLength={MAX_CHARS_FOR_INPUTS}
                          name="summary" {...form.getInputProps('summary')} />
                <small>
                    Characters remaining:
                    {MAX_CHARS_FOR_INPUTS - form.values.summary.length}
                </small>
                <br/>
                <SubmitButton toolTipLabel={"save summary"}
                              label={'save'}/>
            </form>
            }
        </Box>
    );

}

export default SummaryPanel