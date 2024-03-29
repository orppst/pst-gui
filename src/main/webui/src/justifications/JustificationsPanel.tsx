import {ReactElement} from "react";
import {Badge, Box, Container, Title} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    useProposalResourceGetJustification,
    useProposalResourceGetObservingProposalTitle
} from "../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../constants.tsx";
import {Justification} from "../generated/proposalToolSchemas.ts";
import JustificationsTable from "./justifications.table.tsx";

//no need to use an array, only two "kinds" of Justification 'scientific' and 'technical'
export type JustificationKinds = {
    scientific: Justification,
    technical: Justification
}

export default function JustificationsPanel() : ReactElement {

    const { selectedProposalCode } = useParams();

    const {
        data: title,
        error: titleError,
        isLoading: titleIsLoading
    } = useProposalResourceGetObservingProposalTitle(
        {pathParams: {proposalCode: Number(selectedProposalCode)}}
    )

    const {
        data : scientific,
        error : scientificError,
        isLoading : scientificIsLoading,
    } = useProposalResourceGetJustification(
        { pathParams: { proposalCode: Number(selectedProposalCode), which: "scientific" } }
    );

    const {
        data : technical,
        error : technicalError,
        isLoading : technicalIsLoading,
    } = useProposalResourceGetJustification(
        { pathParams: { proposalCode: Number(selectedProposalCode), which: "technical" } }
    );

    if (titleError) {
        return (
            <Box>
                <pre>{JSON.stringify(scientificError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }


    if (scientificError) {
        return (
            <Box>
                <pre>{JSON.stringify(scientificError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    if (technicalError) {
        return (
            <Box>
                <pre>{JSON.stringify(technicalError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    return (
        <Container fluid>
            <Title order={3}>
                { titleIsLoading ?
                    <Badge size={"xl"} radius={0}>...</Badge> :
                    <Badge size={"xl"} radius={0}>{title}</Badge>
                } : Justifications
            </Title>

            {scientificIsLoading || technicalIsLoading ? (`Loading justifications...`) :
                <JustificationsTable scientific={scientific!} technical={technical!} />
            }
        </Container>
    )
}