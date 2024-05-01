import {ReactElement} from "react";
import {Container, Text} from "@mantine/core";
import {ManagerPanelTitle} from "../../commonPanelFeatures/title.tsx";
import {useParams} from "react-router-dom";

export default function CycleObservatoryPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <Container fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Observatory"} />
            <Text>WIP: this is where you view/edit the observatory used for the cycle</Text>
        </Container>
    )
}