import {ReactElement, useEffect, useState} from "react";
import {Box, Container, Text, TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceReplaceCycleTitle,
    ProposalCyclesResourceReplaceCycleTitleVariables,
    useProposalCyclesResourceGetProposalCycleTitle
} from "../../generated/proposalToolComponents.ts";
import {useForm} from "@mantine/form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {HEADER_FONT_WEIGHT, JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";

const titleFormJSON =  {
    initialValues: {title: "Loading..."},
    validate: {
        title: (value : string) => (
            value.length < 1 ? 'Title cannot be blank' : null)
    }
};

export default function CycleTitlePanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("")
    const { data, error, isLoading, status } =
        useProposalCyclesResourceGetProposalCycleTitle(
            {pathParams: {cycleCode: Number(selectedCycleCode)}}
        );

    const form = useForm(titleFormJSON);

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => {
            //IMPL the code generator does not create the correct type
            // signature for API calls where the body is plain text.
            const newTitle : ProposalCyclesResourceReplaceCycleTitleVariables = {
                pathParams: {cycleCode: Number(selectedCycleCode)},
                body: title,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }
            return fetchProposalCyclesResourceReplaceCycleTitle(newTitle);
        },
        onMutate: () => {
            setSubmitting(true);
        },
        onError: () => {
            console.log("An error occurred trying to update the title")
        },
        onSuccess: () => {
            //IMPL this is slightly limiting the invalidation -
            // some things should be ok still (users etc).
            queryClient.invalidateQueries(["pst","api","proposals"])
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
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const updateTitle = form.onSubmit((val) => {
        form.validate();
        setTitle(val.title);
        mutation.mutate();
    });

    return (
        <Container fluid>
            <Text fz="lg" fw={HEADER_FONT_WEIGHT}>Update title</Text>
            { isLoading ? ("Loading..") :
                submitting ? ("Submitting..."):
                    <form onSubmit={updateTitle}>
                        <TextInput name="title"
                                   maxLength={MAX_CHARS_FOR_INPUTS}
                                   {...form.getInputProps('title')}/>
                        <MaxCharsForInputRemaining length={form.values.title.length} />
                        <br/>
                        <SubmitButton toolTipLabel={"save title"}
                                      label={"Save"}/>
                    </form>
            }
        </Container>
    )
}