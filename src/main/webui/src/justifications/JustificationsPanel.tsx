import {ReactElement} from "react";
import {Box, Container} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useProposalResourceGetJustification} from "../generated/proposalToolComponents.ts";
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
        data : scientific,
        error : scientificError,
        isLoading : scientificIsLoading,
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
    } = useProposalResourceGetJustification(
        { pathParams: {
                proposalCode: Number(selectedProposalCode), which: "technical"
            }
        }
    );

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

    return (
        <Container fluid>
            {scientificIsLoading && technicalIsLoading ? (`Loading justifications...`) :
                <JustificationsTable scientific={scientific!} technical={technical!} />
            }
        </Container>
    )
}