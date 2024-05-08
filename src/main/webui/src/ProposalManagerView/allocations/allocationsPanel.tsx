import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelTitle, PanelFrame} from "../../commonPanelFeatures/title.tsx";

export default function CycleAllocationsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Allocations"} />
            <Text>WIP: this is where you view/edit the allocation of reviewed proposals</Text>
        </PanelFrame>
    )
}