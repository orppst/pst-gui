import {ReactElement} from "react";
import {Box, Container} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    useProposalResourceGetJustification,
} from "src/generated/proposalToolComponents.ts";
import {JSON_SPACES} from "src/constants.tsx";
import {Justification} from "src/generated/proposalToolSchemas.ts";
import JustificationsTable from "./justifications.table.tsx";
import {EditorPanelTitle} from "../../commonPanelFeatures/title.tsx";

//no need to use an array, only two "kinds" of Justification 'scientific' and 'technical'
export type JustificationKinds = {
    scientific: Justification,
    technical: Justification
}

export default function JustificationsPanel() : ReactElement {

    const { selectedProposalCode } = useParams();

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
            <EditorPanelTitle proposalCode={Number(selectedProposalCode)} panelTitle={"Justifications"} />

            {scientificIsLoading || technicalIsLoading ? (`Loading justifications...`) :
                <JustificationsTable scientific={scientific!} technical={technical!} />
            }
        </Container>
    )
}