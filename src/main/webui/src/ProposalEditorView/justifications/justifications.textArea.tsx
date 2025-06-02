import {UseFormReturnType} from "@mantine/form";
import {TextFormats} from "../../generated/proposalToolSchemas.ts";
import {ReactElement} from "react";
import {Group, Paper, ScrollArea, Text} from "@mantine/core";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-latex.js";
import "prismjs/components/prism-rest.js";
import "prismjs/components/prism-asciidoc.js";
import {MAX_CHARS_FOR_JUSTIFICATION} from "../../constants.tsx";

export
const JustificationTextArea =
    ({form, format, vpHeight} : {form: UseFormReturnType<{text: string}>, format: TextFormats, vpHeight: number})
        : ReactElement =>
    {
        const remaining = MAX_CHARS_FOR_JUSTIFICATION - form.getValues().text?.length;

        const remainingColour = remaining == 0 ? "red" : remaining < 300 ? "yellow" : "green";

        return (
            <>
            <ScrollArea.Autosize mah={vpHeight * 0.62} scrollbars={"y"} type={"auto"}>
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
                {
                    remaining < 600 &&
                    <Group justify={'flex-end'}>
                        <Text size={"xs"} c={remainingColour}>
                            characters used: {form.getValues().text?.length ?? 0} / {MAX_CHARS_FOR_JUSTIFICATION}
                        </Text>
                    </Group>
                }
            </>
        )
    }