import {
    useProposalResourceGetTechnicalGoals,
} from "../generated/proposalToolComponents";
import {Box, Text} from "@mantine/core";
import {useParams} from "react-router-dom";

function GoalsPanel() {
    const { selectedProposalCode } = useParams();
    const { data , error, isLoading } = useProposalResourceGetTechnicalGoals({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    return (
        <Box>
            <Text fz="lg" fw={700}>This is where technical goals will be managed</Text>
            <Box>
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

export default GoalsPanel