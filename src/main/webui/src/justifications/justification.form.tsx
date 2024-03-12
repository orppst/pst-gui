import {ReactElement} from "react";
import {Grid, Select, Textarea} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {JustificationProps} from "./justifications.table.tsx";

const JustificationTextArea = (props: JustificationProps) => {
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

const SelectTextFormat = (props: JustificationProps) => {
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

    const handleSubmit = () =>{}

    return (
        <form onSubmit={handleSubmit}>
            <Grid span={10} grow>
                <Grid.Col span={{base: 6, md: 8, lg: 9}}>
                    <JustificationTextArea {...props} />
                </Grid.Col>
                <Grid.Col span={{base: 4, md: 2, lg: 1}}>
                    <SelectTextFormat {...props} />
                </Grid.Col>
            </Grid>
        </form>
    )
}