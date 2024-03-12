import {ReactElement} from "react";
import {Grid, Select, Textarea} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {JustificationProps, Which} from "./justifications.table.tsx";
import {Justification, TextFormats} from "../generated/proposalToolSchemas.ts";
import {useForm, UseFormReturnType} from "@mantine/form";


type whichForm = {
    which : Which,
    form : UseFormReturnType<Justification>
}

const JustificationTextArea = (props: whichForm) => {
    return (
        <Textarea
            autosize
            minRows={3}
            maxRows={10}
            maxLength={MAX_CHARS_FOR_INPUTS}
            description={
                MAX_CHARS_FOR_INPUTS - props.form.values.text!.length
                + "/" + String(MAX_CHARS_FOR_INPUTS)
            }
            inputWrapperOrder={['label', 'error', 'input', 'description']}
            placeholder={props.which + " justification text"}
            {...props.form.getInputProps('text')}
        />
    )
}

const SelectTextFormat = (props: whichForm) => {
    return (
        <Select
            placeholder={props.which + " text format"}
            data = {[
                {value: 'LATEX', label: 'Latex'},
                {value: 'RST', label: 'RST'},
                {value: 'ASCIIDOC', label: 'ASCIIDOC'}
            ]}
            {...props.form.getInputProps('format')}
        />
    )
}


export default function JustificationForm(props: JustificationProps)
    :ReactElement {

    const DEFAULT_JUSTIFICATION : Justification = {text: "", format: "ASCIIDOC" };

    const form: UseFormReturnType<Justification> =
        useForm<Justification>({
            initialValues: props.justification ?? DEFAULT_JUSTIFICATION ,
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty for a" + props.which + " justification" : null),
                format: (value: TextFormats | undefined ) =>
                    (value !== "LATEX" && value !== "RST" && value !== "ASCIIDOC" ?
                        'Text format one of: LATEX, RST, or ASCIIDOC' : null)
            }
        });


    const handleSubmit = () =>{}

    return (
        <form onSubmit={handleSubmit}>
            <Grid span={10} grow>
                <Grid.Col span={{base: 6, md: 8, lg: 9}}>
                    <JustificationTextArea which={props.which} form={form} />
                </Grid.Col>
                <Grid.Col span={{base: 4, md: 2, lg: 1}}>
                    <SelectTextFormat which={props.which} form={form} />
                </Grid.Col>
            </Grid>
        </form>
    )
}