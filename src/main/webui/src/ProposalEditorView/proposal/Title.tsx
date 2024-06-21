import {useState, useEffect} from "react";
import {
    fetchProposalResourceReplaceTitle,
    ProposalResourceReplaceTitleVariables,
    useProposalResourceGetObservingProposalTitle,
} from "src/generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Stack, TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from 'src/commonButtons/save';
import { MAX_CHARS_FOR_INPUTS, JSON_SPACES } from 'src/constants';
import MaxCharsForInputRemaining from "src/commonInputs/remainingCharacterCount.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

const titleFormJSON =  {
    initialValues: {title: "Loading..."},
    validate: {
        title: (value : string) => (
            value.length < 1 ? 'Title cannot be blank' : null)
    }
};

function TitlePanel() {
    const { selectedProposalCode } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("")
    const { data, error, isLoading, status } =
        useProposalResourceGetObservingProposalTitle(
            {pathParams:
                    {proposalCode: Number(selectedProposalCode)},},
            {enabled: true});
    const form = useForm(titleFormJSON);

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => {
            //IMPL the code generator does not create the correct type
            // signature for API calls where the body is plain text.
            const newTitle : ProposalResourceReplaceTitleVariables = {
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
        onError: (error) => {
            console.error("An error occurred trying to update the title");
            notifyError("Update failed", getErrorMessage(error))
        },
        onSuccess: () => {
            //IMPL this is slightly limiting the invalidation -
            // some things should be ok still (users etc).
            queryClient.invalidateQueries(["pst","api","proposals"])
                .then(() => setSubmitting(false));
                notifySuccess("Update title", "Update successful");
                form.resetDirty();
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
            <PanelFrame>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const updateTitle = form.onSubmit((val) => {
        form.validate();
        setTitle(val.title);
        mutation.mutate();
    });

    return (
        <PanelFrame>
            <PanelHeader isLoading={isLoading} itemName={data as unknown as string} panelHeading={"Title"} />
            { isLoading ? ("Loading..") :
                 submitting ? ("Submitting..."):
            <form onSubmit={updateTitle}>
                <Stack>
                    <TextInput name="title"
                               maxLength={MAX_CHARS_FOR_INPUTS}
                               {...form.getInputProps('title')}/>
                    <MaxCharsForInputRemaining length={form.values.title.length} />
                    <FormSubmitButton form={form} />
                </Stack>
            </form>
            }
        </PanelFrame>
    );

}

export default TitlePanel