import {
    useProposalResourceGetObservingProposalTitle,
    useTechnicalGoalResourceGetTechnicalGoals,
} from "../generated/proposalToolComponents.ts";
import {Badge, Box, Group, Space, Table} from "@mantine/core";
import {useParams} from "react-router-dom";
import TechnicalGoalRow from "./table.row.tsx";
import TechnicalGoalNewModal from "./new.modal.tsx";
import {TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import { JSON_SPACES } from '../constants.tsx';

export type TechnicalGoalId = {id: number};

export type TechnicalGoalClose = {
    goal: TechnicalGoal,
    close: () => void
}

function GoalsPanel() {
    const { selectedProposalCode } = useParams();
    const { data: goals, error: goalsError, isLoading: goalsLoading } =
        useTechnicalGoalResourceGetTechnicalGoals({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            },
            {enabled: true}
        );

    if (goalsError) {
        return (
            <Box>
                <pre>{JSON.stringify(goalsError, null, JSON_SPACES)}</pre>
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
                <pre>{JSON.stringify(titleError, null, JSON_SPACES)}</pre>
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
                    <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Angular resolution</Table.Th>
                        <Table.Th>Largest scale</Table.Th>
                        <Table.Th>Sensitivity</Table.Th>
                        <Table.Th>Dynamic Range</Table.Th>
                        <Table.Th>Spectral point</Table.Th>
                        <Table.Th>Spectral windows</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                    {
                        goals?.map((goal) => {
                            return (
                                <TechnicalGoalRow
                                    id={goal.dbid!}
                                    key={goal.dbid!}/>
                            )
                        })
                    }
                    </Table.Tbody>
                </Table>
            }

            <Space h={"xs"}/>

            <Group justify={'flex-end'}>
                {goalsLoading ? (`Loading...`) : <TechnicalGoalNewModal/>}
            </Group>
        </div>
    );

}

export default GoalsPanel