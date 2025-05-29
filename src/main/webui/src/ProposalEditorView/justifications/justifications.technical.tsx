import {ReactElement} from "react";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {useJustificationsResourceUpdateTechnicalJustification} from "../../generated/proposalToolComponents.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {Fieldset, Group} from "@mantine/core";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {JustificationTextArea} from "./justifications.textArea.tsx";
import {Justification} from "../../generated/proposalToolSchemas.ts";

export default
function JustificationsTechnical({technical, vpHeight} : {technical: Justification, vpHeight: number})
    : ReactElement {

    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const technicalMutation =
        useJustificationsResourceUpdateTechnicalJustification();

    const technicalForm: UseFormReturnType<{ text: string }> =
        useForm<{text: string}>({
            initialValues: {text: technical.text ?? "" },
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty" : null)
            }
        });

    const handleTechnicalSubmit = technicalForm.onSubmit((values) => {
        technicalMutation.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            },
            body: {text: values.text, format: 'latex'}
        }, {
            onSuccess: () => {
                notifySuccess("Update successful", "technical justification text updated");
                queryClient.invalidateQueries().then();
            },
            onError: (error) =>
                notifyError("Update justification error", getErrorMessage(error))
        })
    });

    return (
        <Fieldset legend={"Technical Justification"}>
            <form onSubmit={handleTechnicalSubmit}>
                <JustificationTextArea
                    form={technicalForm}
                    format={'latex'}
                    vpHeight={vpHeight}
                />
                <Group grow mt={"xs"}>
                    <FormSubmitButton
                        toolTipLabel={"save changes to text"}
                        form={technicalForm}
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