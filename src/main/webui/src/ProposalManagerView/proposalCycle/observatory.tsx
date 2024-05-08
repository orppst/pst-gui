import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";

export default function CycleObservatoryPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame fluid>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Observatory"} />
            <Text>WIP: this is where you view/edit the observatory used for the cycle</Text>
        </PanelFrame>
    )
}