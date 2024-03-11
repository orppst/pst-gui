import {ReactElement, useEffect, useState} from "react";
import {Box, Container, Grid, Select, Textarea} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useProposalResourceGetJustification} from "../generated/proposalToolComponents.ts";
import {JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {useForm, UseFormReturnType} from "@mantine/form";
import {Justification, TextFormats} from "../generated/proposalToolSchemas.ts";


interface JustificationsFormValues {
    scientific: Justification,
    technical: Justification
}

type Which = 'scientific' | 'technical';


export default function JustificationsPanel() : ReactElement {

    const DEFAULT_JUSTIFICATION : Justification = {text: "", format: "ASCIIDOC" };


    const { selectedProposalCode } = useParams();

    //we need these states to set the texts correctly on first visit to the JustificationsPanel
    const [_scientificJustification, setScientificJustification]
        = useState<Justification>(DEFAULT_JUSTIFICATION);
    const [_technicalJustification, setTechnicalJustification]
        = useState<Justification>(DEFAULT_JUSTIFICATION);

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
            setScientificJustification(scientific ?? DEFAULT_JUSTIFICATION);
            form.values.scientific = scientific ?? DEFAULT_JUSTIFICATION;
        }
        if(technicalStatus === 'success') {
            setTechnicalJustification(technical ?? DEFAULT_JUSTIFICATION);
            form.values.technical = technical ?? DEFAULT_JUSTIFICATION
        }
    }, [scientificStatus, scientific, technicalStatus, technical]);

    const form: UseFormReturnType<JustificationsFormValues> =
        useForm<JustificationsFormValues>({
            initialValues: {
                scientific: scientific ? scientific : DEFAULT_JUSTIFICATION,
                technical: technical ? technical : DEFAULT_JUSTIFICATION
            },
            validate: {
                scientific : {
                    text: (value: string | undefined) =>
                        (value === "" || value === undefined ?
                            "Text cannot be empty for a Scientific Justification" : null),
                    format: (value: TextFormats | undefined ) =>
                        (value !== "LATEX" && value !== "RST" && value !== "ASCIIDOC" ?
                            'Text format one of: LATEX, RST, or ASCIIDOC' : null)
                },
                technical : {
                    text: (value: string | undefined) =>
                        (value === "" || value === undefined ?
                            "Text cannot be empty for a Technical Justification" : null),
                    format: (value: TextFormats | undefined) =>
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
                        form.values.scientific.text!.length : form.values.technical.text!.length)
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
                {...form.getInputProps(which + '.format')}
            />
        )
    }


    const handleSubmit = () =>{}

    return (
        <Container fluid>
            {scientificIsLoading && technicalIsLoading ? (`Loading justifications...`) :
                <form onSubmit={handleSubmit}>
                    <Grid span={10} grow>
                        <Grid.Col span={{base: 6, md: 8, lg: 9}}>
                            {JustificationTextArea('scientific')}
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 2, lg: 1}}>
                            {SelectTextFormat('scientific')}
                        </Grid.Col>
                        <Grid.Col span={{base: 6, md: 8, lg: 9}}>
                            {JustificationTextArea('technical')}
                        </Grid.Col>
                        <Grid.Col span={{base: 4, md: 2, lg: 1}}>
                            {SelectTextFormat('technical')}
                        </Grid.Col>
                    </Grid>
                </form>
            }
        </Container>
    )
}