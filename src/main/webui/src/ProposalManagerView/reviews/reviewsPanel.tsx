import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelTitle, PanelFrame} from "../../commonPanelFeatures/title.tsx";

export default function CycleReviewsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Reviews"} />
            <Text>WIP: this is where you view/edit reviews of submitted proposals</Text>
        </PanelFrame>
    )
}