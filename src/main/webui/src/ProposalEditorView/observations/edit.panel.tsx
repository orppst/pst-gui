import {ReactElement} from 'react';
import {useParams} from "react-router-dom";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import ObservationEditGroup from "./edit.group.tsx";
import {useObservationResourceGetObservation} from "src/generated/proposalToolComponents.ts";
import {JSON_SPACES} from "src/constants.tsx";

/**
 * renders a panel for creating or editing an observation.
 *
 * When the route contains an observationId param the observation is fetched
 * and the form is pre-populated (edit mode). When observationId is absent
 * the form starts empty (new mode).
 *
 * @return {ReactElement} the dynamic html for the observation edit panel.
 * @constructor
 */
function ObservationEditPanel(): ReactElement {
    const {selectedProposalCode, observationId} = useParams();
    const isNew = !observationId;

    const {data: observation, isLoading, error} =
        useObservationResourceGetObservation(
            {pathParams: {
                proposalCode: Number(selectedProposalCode),
                observationId: Number(observationId)
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
                    "New Observation" :
                    "Edit Observation #" + observationId}
            />
            <ObservationEditGroup observation={isNew ? undefined : observation} />
        </PanelFrame>
    );
}

export default ObservationEditPanel;
