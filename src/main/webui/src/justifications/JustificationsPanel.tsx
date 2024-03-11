import {ReactElement, useEffect, useState} from "react";
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

    //we need these states to set the texts correctly on first visit to the JustificationsPanel
    const [_scientificText, setScientificText] = useState("");
    const [_technicalText, setTechnicalText] = useState("");

    const {
        data : scientific,
        error : scientificError,
        isLoading : scientificIsLoading,
        status : scientificStatus
    } = useProposalResourceGetJustification(
        { pathParams: {
            proposalCode: Number(selectedProposalCode), which: "scientific"
            }
        }
    );

    const {
        data : technical,
        error : technicalError,
        isLoading : technicalIsLoading,
        status: technicalStatus
    } = useProposalResourceGetJustification(
        { pathParams: {
                proposalCode: Number(selectedProposalCode), which: "technical"
            }
        }
    );

    //required to set the texts correctly on first time visit
    useEffect(() => {
        if(scientificStatus === 'success') {
            setScientificText(scientific?.text ?? "");
            form.values.scientific.text = scientific?.text ?? "";
        }
        if(technicalStatus === 'success') {
            setTechnicalText(technical?.text ?? "");
            form.values.technical.text = technical?.text ?? "";
        }
    }, [scientificStatus, scientific, technicalStatus, technical]);

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


    if (scientificError) {
        return (
            <Box>
                Scientific Error
                <pre>{JSON.stringify(scientificError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    if (technicalError) {
        return (
            <Box>
                Technical Error
                <pre>{JSON.stringify(technicalError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }


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