import {
    useProposalResourceGetObservingProposalTitle,
    useProposalResourceGetTechnicalGoals,
} from "../generated/proposalToolComponents.ts";
import {Badge, Box, Group, Space, Table} from "@mantine/core";
import {useParams} from "react-router-dom";
import TechnicalGoalRow from "./table.row.tsx";
import TechnicalGoalsNewModal from "./new.modal.tsx";

export type TechnicalGoalId = {id: number};

function GoalsPanel() {
    const { selectedProposalCode } = useParams();
    const { data: goals , error: goalsError, isLoading: goalsLoading } =
        useProposalResourceGetTechnicalGoals({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            },
            {enabled: true}
        );

    if (goalsError) {
        return (
            <Box>
                <pre>{JSON.stringify(goalsError, null, 2)}</pre>
            </Box>
        );
    }

    const {data: titleData, error: titleError, isLoading: titleLoading} =
        useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: Number(selectedProposalCode)}}
        );

    if (titleError) {
        return (
            <Box>
                <pre>{JSON.stringify(titleError, null, 2)}</pre>
            </Box>
        );
    }

    return (
        <div>
            <h3>
                {titleLoading ?
                    <Badge size={"xl"} radius={0}>...</Badge> :
                    <Badge size={"xl"} radius={0}>{titleData}</Badge>
                }
                : Technical Goals
            </h3>

            {goalsLoading ? (`Loading...`) :
                <Table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Angular resolution (arcsec)</th>
                        <th>Largest scale (degrees)</th>
                        <th>Sensitivity (dB)</th>
                        <th>Dynamic Range (dB)</th>
                        <th>Spectral point (GHz)</th>
                        <th>Spectral windows</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        goals?.map((goal) => {
                            return (
                                <TechnicalGoalRow id={goal._id!} />
                            )
                        })
                    }
                    </tbody>
                </Table>
            }

            <Space h={"xs"}/>

            <Group position={"right"}>
                {goalsLoading ? (`Loading...`) : <TechnicalGoalsNewModal/>}
            </Group>
        </div>
    );

}

export default GoalsPanel