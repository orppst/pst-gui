import {ReactElement, useEffect, useState} from "react";
import {Stack, TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    useProposalCyclesResourceGetProposalCycleTitle,
    useProposalCyclesResourceReplaceCycleTitle
} from "../../generated/proposalToolComponents.ts";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import {JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";

/**
 * Update the title of a proposal cycle, count and limit the characters to MAX_CHARS_FOR_INPUTS
 * Works the same way as TitlePanel for proposals.
 *
 * @return ReactElement of the title edit panel
 */
export default function CycleTitlePanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [cycleTitle, setCycleTitle] = useState("Loading...")
    const title =
        useProposalCyclesResourceGetProposalCycleTitle(
            {pathParams: {cycleCode: Number(selectedCycleCode)}}
        );

    const form = useForm({
        initialValues: {title: cycleTitle},
        validate: {
            title: (value : string) => (
                value.length < 1 ? 'Title cannot be blank' : null)
        }
    });

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

    const queryClient = useQueryClient()

    const replaceTitleMutation = useProposalCyclesResourceReplaceCycleTitle({
        onMutate: () => {
            setSubmitting(true);
        },
        onError: (error) => {
            console.error("An error occurred trying to update the title");
            notifyError("Update failed", getErrorMessage(error));
            setSubmitting(false);
        },
        onSuccess: () => {
            queryClient.invalidateQueries()
                .then(()=> setSubmitting(false));
            notifySuccess("Update title", "Update successful");
            form.resetDirty();
        }
    });

    useEffect(() => {
        if (title.status === 'success') {
            setCycleTitle(title.data as unknown as string);
            form.values.title = title.data as unknown as string;
        }
    }, [title.status,title.data]);

    if (title.error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(title.error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const updateTitle = form.onSubmit((val) => {
        form.validate();
        setCycleTitle(val.title);
        replaceTitleMutation.mutate({
            pathParams: {cycleCode: Number(selectedCycleCode)},
            body: val.title,
            // @ts-ignore
            headers: {"Content-Type": "text/plain"}
        });
    });

    return (
        <PanelFrame>
            <PanelHeader isLoading={title.isLoading} itemName={title.data as unknown as string} panelHeading={"Title"} />
            { title.isLoading ? ("Loading..") :
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
    )
}