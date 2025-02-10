import {ReactElement, useState} from "react";
import {Fieldset, Group, Paper, Radio, ScrollArea, Stack, Text} from "@mantine/core";
import {MAX_CHARS_FOR_JUSTIFICATION} from "src/constants.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {Justification, TextFormats} from "src/generated/proposalToolSchemas.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {
    useJustificationsResourceUpdateJustification
} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {FormSubmitButton} from "src/commonButtons/save.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import Editor from "react-simple-code-editor";
import { languages, highlight } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-latex.js";
import "prismjs/components/prism-rest.js";
import "prismjs/components/prism-asciidoc.js";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import CancelButton from "../../commonButtons/cancel.tsx";
import {modals} from "@mantine/modals";

/*
    Justification text is save-on-demand via a button click. Justification format is saved on change.
 */


//Dev Note: if you try to embed this const function inside the export default function
// the text area of the Editor loses focus immediately after a single keystroke, maybe
// because the form is set "onValueChange" so triggers a rerender of the modal??
const JustificationTextArea =
    ({form, format} : {form: UseFormReturnType<{text: string}>, format: TextFormats}): ReactElement => {
    return (
        <ScrollArea.Autosize mah={450} scrollbars={"y"} type={"auto"}>
            <Paper withBorder={true} bg={"gray.1"} c={"black"} p={"xs"} my={"xs"} mr={"xs"}>
                <Editor
                    value={form.getValues().text ?? ""}
                    onValueChange={newValue => {
                        form.setValues({text: newValue});
                    }}
                    highlight={
                        code => {
                            switch (format) {
                                case "asciidoc":
                                    return highlight(code ?? "", languages.asciidoc, 'asciidoc');
                                case "latex":
                                    return highlight(code ?? "", languages.latex, 'latex');
                                case "rst":
                                    return highlight(code ?? "", languages.rest, 'rest')}
                        }
                    }
                    maxLength={MAX_CHARS_FOR_JUSTIFICATION}
                />
            </Paper>
        </ScrollArea.Autosize>
    )
}

export default
function JustificationForm(props: JustificationProps) : ReactElement {
    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [justification, setJustification] = useState<Justification>(props.justification)

    const justificationMutation = useJustificationsResourceUpdateJustification();

    const form: UseFormReturnType<{ text: string }> =
        useForm<{text: string}>({
            initialValues: {text: props.justification.text ?? "" },
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty for a " + props.which + " justification" : null)
            }
        });

    const handleSubmit = form.onSubmit((values) => {

        justificationMutation.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                which: props.which
            },
            body: {text: values.text, format: justification.format}
        }, {
            onSuccess: () => {
                notifySuccess("Update successful", props.which + " justification text updated");
                queryClient.invalidateQueries().then();
            },
            onError: (error) =>
                notifyError("Update justification error", getErrorMessage(error))
        })
    });

    const handleFormatUpdate = (update: Justification) => {
        setJustification(update);

        justificationMutation.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                which: props.which
            },
            body: update
        }, {
            onSuccess: (data) => {
                notifySuccess("Update successful",
                    props.which + " justification format changed to " + data.format);
                queryClient.invalidateQueries().then();
            }
,
            onError: (error) =>
                notifyError("Update justification error", getErrorMessage(error))
        })
    }

    const SelectTextFormatRadio = () => {
        return (
            <Radio.Group
                value={justification.format}
                onChange={(event) => {
                    handleFormatUpdate({text: justification.text, format: event as TextFormats})
                }}
                name={"textFormat"}
            >
                <Group justify={"center"}>
                    <Radio value={"latex"} label={"LaTeX"} />
                    <Radio value={"rst"} label={"RST"} />
                    <Radio value={"asciidoc"} label={"ASCIIDOC"} />
                </Group>
            </Radio.Group>
        )
    }

    //called from "Cancel" button
    const confirmDiscardChanges = () => modals.openConfirmModal({
        title: "Discard text changes?",
        centered: true,
        children: (
            <Text size={"sm"}>
                You have unsaved changes to the text of this justification.
                Please confirm that you would like to discard these changes.
            </Text>
        ),
        labels: {confirm: "Discard and close window", cancel: "No, go back"},
        confirmProps: {color: "red"},
        onConfirm: () => props.closeModal!()
    })

    return (
        <Stack>
            <Fieldset legend={"Text Format"}>
                <SelectTextFormatRadio />
            </Fieldset>
            <Fieldset legend={"Text Editor"}>
                <form onSubmit={handleSubmit}>
                    <JustificationTextArea
                        form={form}
                        format={justification.format!}
                    />
                    <Group grow mt={"xs"}>
                        <FormSubmitButton
                            toolTipLabel={"save changes to text"}
                            form={form}
                            variant={"filled"}
                            toolTipLabelPosition={"bottom"}
                            notValidToolTipLabel={"Justification text must not be blank"}
                            notDirtyToolTipLabel={"Justification text has not been modified"}
                        />
                        <CancelButton
                            toolTipLabel={form.isDirty() ? "you have unsaved changes" : "close window"}
                            toolTipLabelPosition={"bottom"}
                            onClick={() => {
                                form.isDirty() ? confirmDiscardChanges() : navigate("../",{relative:"path"})
                            }}
                            variant={"light"}
                        />
                    </Group>
                </form>
            </Fieldset>
        </Stack>

    );
}