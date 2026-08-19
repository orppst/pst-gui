import {
    useProposalResourceGetObservingProposal,
    useTechnicalGoalResourceGetTechnicalGoals,
} from 'src/generated/proposalToolComponents.ts';
import {Grid, Space} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import {TechnicalGoalsTable } from './technicalGoalTable.tsx';
import { TechnicalGoal } from 'src/generated/proposalToolSchemas.ts';
import { ReactElement } from 'react';
import { JSON_SPACES } from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import AddButton from "src/commonButtons/add.tsx";

/**
 * the data type shared by the edit components.
 *
 * @param {TechnicalGoal | undefined} technicalGoal the technical goal data,
 * or undefined if new technical goal.
 */
export type TechnicalGoalProps = {
    technicalGoal: TechnicalGoal | undefined,
}

/**
 * builds the technical goal panel.
 *
 * @return {ReactElement} the dynamic html for the technical goal panel.
 * @constructor
 */
function TechnicalGoalsPanel(): ReactElement {

    const { selectedProposalCode } = useParams();
    const navigate = useNavigate();

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

    // acquire all the bound technical ids in observations.
    let boundTechnicalGoalIds: (number | undefined)[] | undefined;
    boundTechnicalGoalIds = proposalsData?.observations?.map((observation) => {
        // extract the id. it seems the technical Goal returned here IS a number
        // not the TechnicalGoal object it advertises.
        return observation.technicalGoal as number;
    });

    if (goalsError) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(goalsError, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }
    //<AddButton> navigates to the new technical goal panel
    // the "view/edit" button is found in TechnicalGoalsTable, specifically one per row
    return (
        <PanelFrame fluid>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Technical Goals"} />
            <ContextualHelpButton messageId="MaintTechGoalList" />
            {goalsLoading ? (`Loading...`) :
                <TechnicalGoalsTable
                    goals={goals}
                    boundTechnicalGoalIds={boundTechnicalGoalIds}
                    showButtons={true}
                    selectedTechnicalGoal={undefined}/>
            }
            <Space h={"xl"}/>
            <Grid>
               <Grid.Col span={10}></Grid.Col>
                   <AddButton toolTipLabel={"new technical goal"}
                              onClick={() => navigate("new")} />
            </Grid>
        </PanelFrame>
    );
}

export default TechnicalGoalsPanel