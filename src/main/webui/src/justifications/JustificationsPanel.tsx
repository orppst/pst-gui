import {ReactElement} from "react";
import {Box, Container, Group, Select, Textarea} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useProposalResourceGetJustification} from "../generated/proposalToolComponents.ts";
import {JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {useForm, UseFormReturnType} from "@mantine/form";


interface JustificationsFormValues {
    scientific: {
        text: string,
        textFormat: string
    },
    technical: {
        text: string,
        textFormat: string
    }
}

type Which = 'scientific' | 'technical';


export default function JustificationsPanel() : ReactElement {
    const { selectedProposalCode } = useParams();

    const {
        data : scientific,
        error : scientificError,
        isLoading : scientificIsLoading
    } = useProposalResourceGetJustification(
        { pathParams: {
            proposalCode: Number(selectedProposalCode), which: "scientific"
            }
        }
    );

    if (scientificError) {
        return (
            <Box>
                <pre>{JSON.stringify(scientificError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const {
        data : technical,
        error : technicalError,
        isLoading : technicalIsLoading
    } = useProposalResourceGetJustification(
        { pathParams: {
                proposalCode: Number(selectedProposalCode), which: "technical"
            }
        }
    );

    if (technicalError) {
        return (
            <Box>
                <pre>{JSON.stringify(technicalError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const form: UseFormReturnType<JustificationsFormValues> =
        useForm<JustificationsFormValues>({
            initialValues: {
                scientific: {
                    text: scientific ? scientific.text! : "",
                    textFormat: scientific ? scientific.format! : "ASCIIDOC"
                },
                technical: {
                    text: technical ? technical.text! : "",
                    textFormat: scientific ? scientific.format! : "ASCIIDOC"
                }
            },
            validate: {
                scientific : {
                    text: (value: string) =>
                        (value === "" ? "Text cannot be empty for a Scientific Justification" : null),
                    textFormat: (value: string) =>
                        (value !== "LATEX" && value !== "RST" && value !== "ASCIIDOC" ?
                            'Text format one of: LATEX, RST, or ASCIIDOC' : null)
                },
                technical : {
                    text: (value: string) =>
                        (value === "" ? "Text cannot be empty for a Technical Justification" : null),
                    textFormat: (value: string) =>
                        (value !== "LATEX" && value !== "RST" && value !== "ASCIIDOC" ?
                            'Text format one of: LATEX, RST, or ASCIIDOC' : null)
                }
            }
        });


    function JustificationTextArea(which: Which) : ReactElement {
        return (
            <Textarea
                autosize
                minRows={3}
                maxRows={10}
                maxLength={MAX_CHARS_FOR_INPUTS}
                description={
                    MAX_CHARS_FOR_INPUTS
                    - (which === "scientific" ?
                        form.values.scientific.text.length : form.values.technical.text.length)
                    + "/" + String(MAX_CHARS_FOR_INPUTS)
                }
                inputWrapperOrder={['label', 'error', 'input', 'description']}
                placeholder={which + " justification text"}
                {...form.getInputProps(which + '.text')}
            />
        )
    }


    function SelectTextFormat(which: Which) : ReactElement {
        return (
            <Select
                placeholder={"pick one"}
                data = {[
                    {value: 'LATEX', label: 'Latex'},
                    {value: 'RST', label: 'RST'},
                    {value: 'ASCIIDOC', label: 'ASCII'}
                ]}
                {...form.getInputProps(which + '.textFormat')}
            />
        )
    }


    const handleSubmit = () =>{}

    return (
        <Container>
            {scientificIsLoading && technicalIsLoading ? (`Loading justifications...`) :
                <form onSubmit={handleSubmit}>
                    <Group>
                        {JustificationTextArea('scientific')}
                        {SelectTextFormat('scientific')}
                    </Group>
                    <Group>
                        {JustificationTextArea('technical')}
                        {SelectTextFormat('technical')}
                    </Group>
                </form>
            }
        </Container>
    )
}