import {useState, useEffect} from "react";
import {
    fetchProposalResourceReplaceTitle,
    ProposalResourceReplaceTitleVariables,
    useProposalResourceGetObservingProposalTitle,
} from "../generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Box, Text, TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useForm} from "@mantine/form";
import { SubmitButton } from '../commonButtons/save.tsx';

function TitlePanel() {
    const { selectedProposalCode } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("")
    const { data, error, isLoading, status } = useProposalResourceGetObservingProposalTitle(
        {pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});
    const form = useForm({
        initialValues: {title: "Loading..."},
        validate: {
            title: (value) => (value.length < 1 ? 'Title cannot be blank' : null)
        }
    });

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => {
            const newTitle : ProposalResourceReplaceTitleVariables = {//IMPL the code generator does not create the correct type signature for API calls where the body is plain text.
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: title,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }
            return fetchProposalResourceReplaceTitle(newTitle);
        },
        onMutate: () => {
            setSubmitting(true);
        },
        onError: () => {
            console.log("An error occurred trying to update the title")
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pst","api","proposals"])//IMPL this is slightly limiting the invalidation - some things should be ok still (users etc).
                .then(()=> setSubmitting(false))
        },
    })

    useEffect(() => {
        if (status === 'success') {
            setTitle(data as unknown as string);
            form.values.title = data as unknown as string;
        }
    }, [status,data]);

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    const updateTitle = form.onSubmit((val) => {
        form.validate();
        setTitle(val.title);
        mutation.mutate();
    });

    return (
        <Box>
            <Text fz="lg" fw={700}>Update title</Text>
            { isLoading ? ("Loading..") :
                 submitting ? ("Submitting..."):
            <form onSubmit={updateTitle}>
                <TextInput name="title" {...form.getInputProps('title')}/>
                <SubmitButton toolTipLabel={"save title"}></SubmitButton>
            </form>
            }
        </Box>
    );

}

export default TitlePanel