import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import AssignReviewersAccordion from "./assignReviewers.accordion.tsx";



export default function AssignReviewersPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Assign Reviewers"}
            />
            <AssignReviewersAccordion />
        </PanelFrame>
    )
}