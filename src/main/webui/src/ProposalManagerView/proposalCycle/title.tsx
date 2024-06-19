import {ReactElement, useEffect, useState} from "react";
import {TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceReplaceCycleTitle,
    ProposalCyclesResourceReplaceCycleTitleVariables,
    useProposalCyclesResourceGetProposalCycleTitle
} from "../../generated/proposalToolComponents.ts";
import {useForm} from "@mantine/form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

const cycleTitleFormJSON =  {
    initialValues: {title: "Loading..."},
    validate: {
        title: (value : string) => (
            value.length < 1 ? 'Title cannot be blank' : null)
    }
};

/**
 * Update the title of a proposal cycle, count and limit the characters to MAX_CHARS_FOR_INPUTS
 * Works the same way as TitlePanel for proposals.
 *
 * @return ReactElement of the title edit panel
 */
export default function CycleTitlePanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [cycleTitle, setCycleTitle] = useState("")
    const { data, error, isLoading, status } =
        useProposalCyclesResourceGetProposalCycleTitle(
            {pathParams: {cycleCode: Number(selectedCycleCode)}}
        );

    const form = useForm(cycleTitleFormJSON);

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => {
            //IMPL the code generator does not create the correct type
            // signature for API calls where the body is plain text.
            const newTitle : ProposalCyclesResourceReplaceCycleTitleVariables = {
                pathParams: {cycleCode: Number(selectedCycleCode)},
                body: cycleTitle,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }
            return fetchProposalCyclesResourceReplaceCycleTitle(newTitle);
        },
        onMutate: () => {
            setSubmitting(true);
        },
        onError: () => {
            console.error("An error occurred trying to update the title");
            notifyError("Update failed", getErrorMessage(error))
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["pst", "api", "proposalCycles"])
                .then(()=> setSubmitting(false));
            notifySuccess("Update title", "Update successful");
            form.resetDirty();
        },
    })

    useEffect(() => {
        if (status === 'success') {
            setCycleTitle(data as unknown as string);
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
        setCycleTitle(val.title);
        mutation.mutate();
    });

    return (
        <PanelFrame>
            <PanelHeader isLoading={isLoading} itemName={data as unknown as string} panelHeading={"Title"} />
            { isLoading ? ("Loading..") :
                submitting ? ("Submitting..."):
                    <form onSubmit={updateTitle}>
                        <TextInput name="title"
                                   maxLength={MAX_CHARS_FOR_INPUTS}
                                   {...form.getInputProps('title')}/>
                        <MaxCharsForInputRemaining length={form.values.title.length} />
                        <br/>
                        <FormSubmitButton form={form} />
                    </form>
            }
        </PanelFrame>
    )
}