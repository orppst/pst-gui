import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";

export default function CycleReviewsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame fluid>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Reviews"} />
            <Text>WIP: this is where you view/edit reviews of submitted proposals</Text>
        </PanelFrame>
    )
}