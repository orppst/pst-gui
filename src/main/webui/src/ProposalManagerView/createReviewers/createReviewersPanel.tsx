import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {HaveRole} from "../../auth/Roles.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";

export default
function CreateReviewersPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    if (!HaveRole(["tac_admin"])) {
        return <AlertErrorMessage
            title={"Not Authorised"}
            error={"This page is for the TAC administrator only"}
        />
    }
    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Create Reviewers"}
            />
            <>List of people on the system + button to promote them to "reviewer"</>
        </PanelFrame>
    )
}