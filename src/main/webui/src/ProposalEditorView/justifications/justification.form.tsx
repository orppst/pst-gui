import {ReactElement, SyntheticEvent} from "react";
import {Grid, Paper, Select, Stack} from "@mantine/core";
import {MAX_CHARS_FOR_JUSTIFICATION} from "src/constants.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {Justification, TextFormats} from "src/generated/proposalToolSchemas.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {fetchProposalResourceUpdateJustification} from "src/generated/proposalToolComponents.ts";
import {useNavigate,useParams } from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {FormSubmitButton} from "src/commonButtons/save.tsx";
import CancelButton from "src/commonButtons/cancel.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {PreviewJustification} from "./justification.preview.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";

import Editor from "react-simple-code-editor";
import { languages, highlight } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-latex.js";
import "prismjs/components/prism-rest.js";
import "prismjs/components/prism-asciidoc.js";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


const JustificationTextArea = (form : UseFormReturnType<Justification>) => {
    switch(form.values.format) {
        case "asciidoc":
            return (
                <Paper withBorder={true} bg={"gray.1"} c={"black"} p={"xs"} m={"xs"}>
                    <Editor
                        value={form.values.text!}
                        onValueChange={newValue => form.setValues({text: newValue, format: form.values.format})}
                        highlight={code => highlight(code, languages.asciidoc, 'asciidoc')}
                        maxLength={MAX_CHARS_FOR_JUSTIFICATION}
                        {...form.getInputProps('text')}
                    />
                </Paper>
            );
        case "latex":
            return (
                <Paper withBorder={true} bg={"gray.1"} c={"black"} p={"xs"} m={"xs"}>
                    <Editor
                        value={form.values.text!}
                        onValueChange={newValue => form.setValues({text: newValue, format: form.values.format})}
                        highlight={code => highlight(code, languages.latex, 'latex')}
                        maxLength={MAX_CHARS_FOR_JUSTIFICATION}
                        {...form.getInputProps('text')}
                    />
                </Paper>
            );
        case "rst":
            return (
                <Paper withBorder={true} bg={"gray.1"} c={"black"} p={"xs"} m={"xs"}>
                    <Editor
                        value={form.values.text!}
                        onValueChange={newValue => form.setValues({text: newValue, format: form.values.format})}
                        highlight={code => highlight(code, languages.rest, 'rest')}
                        maxLength={MAX_CHARS_FOR_JUSTIFICATION}
                        {...form.getInputProps('text')}
                    />
                </Paper>
            );
    }
}

const SelectTextFormat = (form: UseFormReturnType<Justification>) => {
    return (
        <Select
            placeholder={"text format"}
            data = {[
                {value: 'latex', label: 'Latex'},
                {value: 'rst', label: 'RST'},
                {value: 'asciidoc', label: 'ASCIIDOC'}
            ]}
            {...form.getInputProps('format')}
        />
    )
}


export default function JustificationForm(props: JustificationProps)
    :ReactElement {


    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const DEFAULT_JUSTIFICATION : Justification = {text: "", format: "asciidoc" };

    const form: UseFormReturnType<Justification> =
        useForm<Justification>({
            initialValues: props.justification ?? DEFAULT_JUSTIFICATION ,
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty for a " + props.which + " justification" : null),
                format: (value: TextFormats | undefined ) =>
                    (value !== "latex" && value !== "rst" && value !== "asciidoc" ?
                        'Text format one of: latex, rst, or asciidoc' : null)
            }
        });


    const handleSubmit = form.onSubmit((values) => {
        //create new proposal does not permit having null justifications i.e.,
        //here we only ever 'update' an existing proposal
        fetchProposalResourceUpdateJustification({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                which: props.which
            },
            body: {text: values.text, format: values.format}
        })
            .then(()=>queryClient.invalidateQueries())
            .then(() => {
                notifySuccess("Update successful", props.which + " justification updated");
            })
            .then(props.closeModal)
            .catch((error) => {
                console.error(error);
                notifyError("Update justification error", getErrorMessage(error))
            });
    });
    const navigate = useNavigate();
    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
        }

    return (
        <>
            <form onSubmit={handleSubmit}>
            <ContextualHelpButton messageId="MaintSciJust" />
            <Stack>
               <Grid span={10} grow>
                    <Grid.Col span={{base: 6, md: 8, lg: 9}}>
                        <JustificationTextArea {...form} />
                    </Grid.Col>
                    <Grid.Col span={{base: 4, md: 2, lg: 1}}>
                        <SelectTextFormat {...form} />
                    </Grid.Col>
                </Grid>
            </Stack>
            <p> </p>
            <Grid>
              <Grid.Col span={8}></Grid.Col>
                 <FormSubmitButton form={form} />
                 <CancelButton
                    onClickEvent={handleCancel}
                    toolTipLabel={"Go back without saving"}/>
            </Grid>

            </form>
            {form.values.format==='latex' && PreviewJustification(form.values.format!, form.values.text!)}
        </>
    );
}