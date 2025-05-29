import {ReactElement} from "react";
import {Fieldset, Group} from "@mantine/core";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {useJustificationsResourceUpdateScientificJustification} from "../../generated/proposalToolComponents.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {Justification} from "../../generated/proposalToolSchemas.ts";
import {JustificationTextArea} from "./justifications.textArea.tsx";

export default
function JustificationsScientific(
    {scientific, vpHeight} : {scientific: Justification, vpHeight: number})
    : ReactElement {

    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const scientificMutation =
        useJustificationsResourceUpdateScientificJustification();

    const scientificForm: UseFormReturnType<{ text: string }> =
        useForm<{text: string}>({
            initialValues: {text: scientific.text ?? "" },
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty" : null)
            }
        });

    const handleScientificSubmit = scientificForm.onSubmit((values) => {
        scientificMutation.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            },
            body: {text: values.text, format: 'latex'}
        }, {
            onSuccess: () => {
                notifySuccess("Update successful", "scientific justification text updated");
                queryClient.invalidateQueries().then();
            },
            onError: (error) =>
                notifyError("Update justification error", getErrorMessage(error))
        })
    });

    return (
        <Fieldset legend={"Scientific Justification"}>
            <form onSubmit={handleScientificSubmit}>
                <JustificationTextArea
                    form={scientificForm}
                    format={"latex"}
                    vpHeight={vpHeight}
                />
                <Group grow mt={"xs"}>
                    <FormSubmitButton
                        toolTipLabel={"save changes to text"}
                        form={scientificForm}
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