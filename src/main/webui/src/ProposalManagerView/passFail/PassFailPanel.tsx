import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import AllocationsTable from "./allocations.table.tsx";
import {useSubmittedProposalResourceGetSubmittedNotYetAllocated} from "../../generated/proposalToolComponents.ts";
import {Loader} from "@mantine/core";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";

export default
function PassFailPanel(): ReactElement {

    const {selectedCycleCode} = useParams();

    const notYetAllocated =
        useSubmittedProposalResourceGetSubmittedNotYetAllocated({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

    if (notYetAllocated.isLoading) {
        return(<Loader />)
    }

    if (notYetAllocated.error) {
        notifyError("Failed to load not yet allocated submitted proposals",
            getErrorMessage(notYetAllocated.error))
    }
    
    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Pass/Fail"}
            />
            <AllocationsTable submittedIds={notYetAllocated.data!} />
        </PanelFrame>
    )
}