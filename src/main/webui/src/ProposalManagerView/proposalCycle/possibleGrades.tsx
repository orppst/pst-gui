import {ReactElement} from "react";
import {Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";

export default function CyclePossibleGradesPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Grades"} />
            <Text>WIP: this is where you view/edit the possible grades of a proposal cycle</Text>
        </PanelFrame>
    )
}