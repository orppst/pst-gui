import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelTitle, PanelFrame} from "../../commonPanelFeatures/title.tsx";

export default function CycleObservingModesPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Observing Modes"} />
            <Text>WIP: this is where you view/edit the observing modes of a cycle</Text>
        </PanelFrame>
    )
}