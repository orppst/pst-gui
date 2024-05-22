import {ReactElement} from "react";
import {Grid, Select, Textarea} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "src/constants.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {Justification, TextFormats} from "src/generated/proposalToolSchemas.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import {fetchProposalResourceUpdateJustification} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {SubmitButton} from "src/commonButtons/save.tsx";
import {notifySuccess} from "../../commonPanel/notifications.tsx";
import {PreviewJustification} from "../proposal/Overview.tsx";

const JustificationTextArea = (form : UseFormReturnType<Justification>) => {
    return (
        <Textarea
            autosize
            minRows={3}
            maxRows={10}
            maxLength={MAX_CHARS_FOR_INPUTS}
            description={
                MAX_CHARS_FOR_INPUTS - form.values.text!.length
                + "/" + String(MAX_CHARS_FOR_INPUTS)
            }
            inputWrapperOrder={['label', 'error', 'input', 'description']}
            placeholder={"justification text"}
            {...form.getInputProps('text')}
        />
    )
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
            .catch(console.error);
    });

    return (
        <>
            <form onSubmit={handleSubmit}>
                <SubmitButton
                    label={"Save"}
                    toolTipLabel={"Save updates"}
                    disabled={!form.isDirty() || !form.isValid()}
                />
                <Grid span={10} grow>
                    <Grid.Col span={{base: 6, md: 8, lg: 9}}>
                        <JustificationTextArea {...form} />
                    </Grid.Col>
                    <Grid.Col span={{base: 4, md: 2, lg: 1}}>
                        <SelectTextFormat {...form} />
                    </Grid.Col>
                </Grid>
            </form>
            {PreviewJustification(form.values.format!, form.values.text!)}
        </>
    )
}