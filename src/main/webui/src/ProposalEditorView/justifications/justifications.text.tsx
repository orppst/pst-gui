import {ReactElement} from "react";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {
    useJustificationsResourceUpdateJustification,
} from "../../generated/proposalToolComponents.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {Fieldset, Group, Text} from "@mantine/core";
import {JustificationTextArea} from "./justifications.textArea.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {Justification} from "../../generated/proposalToolSchemas.ts";
import {MAX_CHARS_FOR_SCIENTIFIC, MAX_CHARS_FOR_TECHNICAL} from "../../constants.tsx";

function capitalizeFirstChar(string : string) : string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default
function JustificationsText(
    {justification, which, vpHeight} : {justification: Justification, which: string, vpHeight: number}
) : ReactElement {

    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const scientificMutation =
        useJustificationsResourceUpdateJustification();

    const justificationForm: UseFormReturnType<{ text: string }> =
        useForm<{text: string}>({
            initialValues: {text: justification.text ?? "" },
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty" : null)
            }
        });

    const handleScientificSubmit = justificationForm.onSubmit((values) => {
        scientificMutation.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                which: which
            },
            body: {text: values.text, format: 'latex'}
        }, {
            onSuccess: () => {
                notifySuccess("Update successful", which + " justification text updated");
                justificationForm.resetDirty(); //needed to disable the save button after a successful update
                queryClient.invalidateQueries().then();
            },
            onError: (error) =>
                notifyError("Update justification error", getErrorMessage(error))
        })
    });

    return (
        <Fieldset legend={capitalizeFirstChar(which) + " Text"}>
            {justificationForm.isDirty() &&
                <Text size={"sm"} c={"red"}>
                    *Unsaved changes to {which} justification text.
                </Text>
            }
            <form onSubmit={handleScientificSubmit}>
                <JustificationTextArea
                    form={justificationForm}
                    format={"latex"}
                    vpHeight={vpHeight}
                    charLimit={which === "scientific" ? MAX_CHARS_FOR_SCIENTIFIC : MAX_CHARS_FOR_TECHNICAL}
                />
                <Group grow mt={"xs"}>
                    <FormSubmitButton
                        toolTipLabel={"save changes to text"}
                        form={justificationForm}
                        variant={"filled"}
                        toolTipLabelPosition={"bottom"}
                        notValidToolTipLabel={"Justification text must not be blank"}
                        notDirtyToolTipLabel={"Justification text has not been modified"}
                    />
                </Group>
            </form>
        </Fieldset>
    )
}