import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";

export default function CycleAllocationsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Allocations"} />
            <Text>WIP: this is where you view/edit the allocation of reviewed proposals</Text>
        </PanelFrame>
    )
}