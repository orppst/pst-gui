import {
    useProposalResourceGetObservingProposal,
    useProposalResourceGetObservingProposalTitle,
    useTechnicalGoalResourceGetTechnicalGoals,
} from '../generated/proposalToolComponents.ts';
import { Badge, Box, Group, Space, Table } from '@mantine/core';
import { useParams } from 'react-router-dom';
import TechnicalGoalRow, {
    technicalGoalsHeader
} from './technicalGoalTable.tsx';
import { TechnicalGoal } from '../generated/proposalToolSchemas.ts';
import TechnicalGoalEditModal from './edit.modal.tsx';
import { ReactElement } from 'react';

/**
 * the data type shared by the edit components.
 *
 * @param {TechnicalGoal | undefined} technicalGoal the technical goal data,
 * or undefined if new technical goal.
 * @param {() => void}} closeModal the modal to use when closing.
 */
export type TechnicalGoalProps = {
    technicalGoal: TechnicalGoal | undefined,
    closeModal?: () => void
}

/**
 * builds the technical goal panel.
 *
 * @return {ReactElement} the dynamic html for the technical goal panel.
 * @constructor
 */
function TechnicalGoalsPanel(): ReactElement {

    const { selectedProposalCode } = useParams();

    // needed to track which targets are locked into observations.
    const { data: proposalsData } =
        useProposalResourceGetObservingProposal({
                pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true}
        );

    const {
        data: goals,
        error: goalsError,
        isLoading: goalsLoading } =
        useTechnicalGoalResourceGetTechnicalGoals(
            {pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true}
        );
    const {
        data: titleData,
        error: titleError,
        isLoading: titleLoading} =
        useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: Number(selectedProposalCode)}}
        );


    // acquire all the bound technical ids in observations.
    let boundTechnicalGoalIds: (number | undefined)[] | undefined = [];
    boundTechnicalGoalIds = proposalsData?.observations?.map((observation) => {
        // extract the id. it seems the technical Goal returned here IS a number
        // not the TechnicalGoal object it advertises.
        return observation.technicalGoal as number;
    });

    if (goalsError) {
        return (
            <Box>
                <pre>{JSON.stringify(goalsError, null, 2)}</pre>
            </Box>
        );
    }

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
                    {technicalGoalsHeader()}
                    <Table.Tbody>
                    {
                        goals?.map((goal) => {
                            return (
                                <TechnicalGoalRow
                                    id={goal.dbid!}
                                    key={goal.dbid!}
                                    boundTechnicalGoalIds={boundTechnicalGoalIds}
                                />
                            )
                        })
                    }
                    </Table.Tbody>
                </Table>
            }
            <Space h={"xs"}/>
            <Group justify={'flex-end'}>
                {goalsLoading ? (`Loading...`) :
                    <TechnicalGoalEditModal
                        technicalGoal={undefined}
                    />
                }
            </Group>
        </div>
    );
}

export default TechnicalGoalsPanel