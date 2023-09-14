import { useParams } from "react-router-dom"
import {
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";
import {Box, Text} from "@mantine/core";
import {boxListStyles} from "../Styles";

function OverviewPanel() {
    const { selectedProposalCode } = useParams();
    const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    return (
        <Box>
            <Text fz="lg" fw={700}>This will become nicely formatted overview of the selected proposal</Text>
            <Box  sx={boxListStyles}>
                {isLoading ? (`Loading...`)
                    : (
                        <pre>
                            {`${JSON.stringify(data, null, 2)}`}
                        </pre>
                    )}
            </Box>
        </Box>
    );

}

export default OverviewPanel