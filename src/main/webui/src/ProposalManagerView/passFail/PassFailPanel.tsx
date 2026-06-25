import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import AllocationsTable from "./allocations.table.tsx";
import {Loader} from "@mantine/core";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useHasRole} from "../../auth/Roles.tsx";
import {useSubmittedProposalResourceGetSubmittedProposals} from "../../generated/proposalToolComponents.ts";

export default
function PassFailPanel(): ReactElement {

    const {selectedCycleCode} = useParams();

    const hasRole = useHasRole(["tac_admin", "tac_member"]);

    const submittedProposals =
        useSubmittedProposalResourceGetSubmittedProposals({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    if(!hasRole) {
        return <>Not authorised</>
    }

    if (submittedProposals.isLoading) {
        return(<Loader />)
    }

    if (submittedProposals.error) {
        notifyError("Failed to load not yet allocated submitted proposals",
            getErrorMessage(submittedProposals.error))
    }
    
    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Accept Proposals"}
            />
            <AllocationsTable submittedIds={submittedProposals.data!} />
        </PanelFrame>
    )
}