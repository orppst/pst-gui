import {ReactElement, useState} from "react";
import {Fieldset, Grid, Group, Paper, ScrollArea, Select} from "@mantine/core";
import {MAX_CHARS_FOR_JUSTIFICATION} from "src/constants.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {Justification, TextFormats} from "src/generated/proposalToolSchemas.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {fetchJustificationsResourceUpdateJustification} from "src/generated/proposalToolComponents.ts";
import {useParams } from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {FormSubmitButton} from "src/commonButtons/save.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";

import Editor from "react-simple-code-editor";
import { languages, highlight } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-latex.js";
import "prismjs/components/prism-rest.js";
import "prismjs/components/prism-asciidoc.js";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import JustificationLatex from "./justifications.latex.tsx";

/*
    Form contains the Justification text only. We save the Justification format
    immediately on the user selecting a different format. This avoids the user having
    to remember to "save" the justification when changing from another format to 'Latex'
    and attempting to upload resource files, which will be rejected by the API as the
    Justification is not 'Latex' format.
 */


//Dev Note: if you try to embed this const function inside the export default function
// the text area of the Editor loses focus immediately after a single keystroke; I've no idea why.
const JustificationTextArea =
    ({form, format, unsaved} : {form: UseFormReturnType<{text: string}>, format: TextFormats, unsaved: (val: boolean)=>void})
        : ReactElement => {
        return (
            <ScrollArea h={250} type={"auto"}>
            <Paper withBorder={true} bg={"gray.1"} c={"black"} p={"xs"} m={"xs"}>
                <Editor
                    value={form.getValues().text ?? ""}
                    onValueChange={newValue => {
                        form.setValues({text: newValue});
                        unsaved(form.isDirty());
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
            </ScrollArea>
        )
    }

export default
function JustificationForm(props: JustificationProps) : ReactElement {
    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const [justification, setJustification] = useState<Justification>(props.justification)

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
        fetchJustificationsResourceUpdateJustification({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                which: props.which
            },
            body: {text: values.text, format: justification.format}
        })
            .then(()=>queryClient.invalidateQueries())
            .then(() => {
                notifySuccess("Update successful", props.which + " justification text updated");
                props.unsavedChanges!(false); // changes have been saved
                props.onChange(); //trigger re-fetch of Justifications
            })
            .catch((error) => {
                console.error(error);
                notifyError("Update justification error", getErrorMessage(error))
            });
    });

    const handleFormatUpdate = (update: Justification) => {
        setJustification(update);

        fetchJustificationsResourceUpdateJustification({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                which: props.which
            },
            body: update
        })
            .then(() => {
                notifySuccess("Update successful",
                    props.which + " justification format changed to " + update.format);
            })
            .catch((error) => {
                console.error(error);
                notifyError("Update justification error", getErrorMessage(error))
            });
    }

    const SelectTextFormat = () => {
        return (
            <Select
                mt={10}
                value={justification.format}
                placeholder={"text format"}
                data = {[
                    {value: 'latex', label: 'Latex'},
                    {value: 'rst', label: 'RST'},
                    {value: 'asciidoc', label: 'ASCIIDOC'}
                ]}
                onChange={(event) => {
                    handleFormatUpdate({text: justification.text, format: event as TextFormats})
                }}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <ContextualHelpButton messageId="MaintSciJust" />
            <Grid columns={10}>
                <Grid.Col span={{base: 10, md: 6, lg: 8}} order={{base:2, md: 1, lg: 1}}>
                    <JustificationTextArea
                        form={form}
                        format={justification.format!}
                        unsaved={props.unsavedChanges!}
                    />
                </Grid.Col>
                <Grid.Col span={{base: 10, md: 4, lg: 2}} order={{base:1, md: 2, lg: 2}}>
                    <SelectTextFormat />
                </Grid.Col>
               <Grid.Col span={{base: 10, md: 10, lg: 10}} order={{base:3, md: 3, lg: 3}}>
                   <Group justify={"right"} mt={10}>
                       <FormSubmitButton form={form} />
                   </Group>
                   {
                       justification.format === 'latex' &&
                       <Fieldset legend={"Latex Service"}>
                           <JustificationLatex which={props.which} />
                       </Fieldset>
                   }
               </Grid.Col>
            </Grid>
        </form>
    );
}