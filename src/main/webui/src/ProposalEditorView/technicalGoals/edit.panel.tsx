import {ReactElement} from 'react';
import {useParams} from "react-router-dom";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import TechnicalGoalEditGroup from "./edit.group.tsx";
import {useTechnicalGoalResourceGetTechnicalGoal} from "src/generated/proposalToolComponents.ts";
import {JSON_SPACES} from "src/constants.tsx";

/**
 * renders a panel for creating or editing a technical goal.
 *
 * When the route contains a goalId param the goal is fetched and the form
 * is pre-populated (edit mode). When goalId is absent the form starts empty
 * (new mode).
 *
 * @return {ReactElement} the dynamic html for the technical goal edit panel.
 * @constructor
 */
function TechnicalGoalEditPanel(): ReactElement {
    const {selectedProposalCode, goalId} = useParams();
    const isNew = !goalId;

    const {data: technicalGoal, isLoading, error} =
        useTechnicalGoalResourceGetTechnicalGoal(
            {pathParams: {
                proposalCode: Number(selectedProposalCode),
                technicalGoalId: Number(goalId)
            }},
            {enabled: !isNew}
        );

    if (!isNew && isLoading) {
        return <PanelFrame>Loading...</PanelFrame>;
    }

    if (!isNew && error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    return (
        <PanelFrame>
            <EditorPanelHeader
                proposalCode={Number(selectedProposalCode)}
                panelHeading={isNew ?
                    "New Technical Goal" :
                    "Edit Technical Goal #" + goalId}
            />
            <TechnicalGoalEditGroup technicalGoal={isNew ? undefined : technicalGoal} />
        </PanelFrame>
    );
}

export default TechnicalGoalEditPanel;
