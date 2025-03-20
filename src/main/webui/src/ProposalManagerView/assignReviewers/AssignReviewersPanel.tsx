import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import AssignReviewersAccordion from "./assignReviewers.accordion.tsx";
import {HaveRole} from "../../auth/Roles.tsx";



export default function AssignReviewersPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

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