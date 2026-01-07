import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import AssignReviewersAccordion from "./assignReviewers.accordion.tsx";
import {HaveRole} from "../../auth/Roles.tsx";
import {Fieldset} from "@mantine/core";



export default function AssignReviewersPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    if(!HaveRole(["tac_admin"])) {
        return <>Not authorised</>
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Assign Reviewers"}
            />
            <Fieldset legend={"TODO"}>
                <p>Button to assign all members of the TAC as reviewers to all submitted proposals in the cycle.</p>
                <p>Searchable email field to add other Polaris users as reviewers to each proposal individually.</p>
                <p>This may also include external reviewers who are not in our database - have a button to send them an "invite" email.</p>
            </Fieldset>
            <AssignReviewersAccordion />
        </PanelFrame>
    )
}