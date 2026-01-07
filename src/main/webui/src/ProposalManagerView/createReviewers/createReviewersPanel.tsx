import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {HaveRole} from "../../auth/Roles.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import ListCurrentReviewers from "./listCurrentReviewers.tsx";
import {Fieldset} from "@mantine/core";

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
            <Fieldset legend={"Current Reviewers"}>
                <ListCurrentReviewers />
            </Fieldset>
            <Fieldset legend={"Other Users"}>

            </Fieldset>
        </PanelFrame>
    )
}