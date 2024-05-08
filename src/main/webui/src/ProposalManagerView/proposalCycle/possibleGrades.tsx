import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelTitle, PanelFrame} from "../../commonPanelFeatures/title.tsx";

export default function CyclePossibleGradesPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Grades"} />
            <Text>WIP: this is where you view/edit the possible grades of a proposal cycle</Text>
        </PanelFrame>
    )
}