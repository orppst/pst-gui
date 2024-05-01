import {ReactElement} from "react";
import {Container, Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelTitle} from "../../commonPanelFeatures/title.tsx";

export default function CycleAllocationsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <Container fluid>
            <ManagerPanelTitle proposalCycleCode={Number(selectedCycleCode)} panelTitle={"Allocations"} />
            <Text>WIP: this is where you view/edit the allocation of reviewed proposals</Text>
        </Container>
    )
}