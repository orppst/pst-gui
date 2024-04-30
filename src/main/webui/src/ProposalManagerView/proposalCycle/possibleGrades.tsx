import {ReactElement} from "react";
import {Container, Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelTitle} from "../../commonPanelFeatures/title.tsx";

export default function CyclePossibleGradesPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <Container fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Grades"} />
            <Text>WIP: this is where you view/edit the possible grades of a proposal cycle</Text>
        </Container>
    )
}