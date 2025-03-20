import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {HaveRole} from "../../auth/Roles.tsx";

export default function CycleObservingModesPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Observing Modes"} />
            <Text>WIP: this is where you view/edit the observing modes of a cycle</Text>
        </PanelFrame>
    )
}