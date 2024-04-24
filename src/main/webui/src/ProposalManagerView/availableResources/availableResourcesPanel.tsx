import {ReactElement} from "react";
import {Group, Table} from "@mantine/core";
import {useAvailableResourcesResourceGetCycleAvailableResources} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {randomId} from "@mantine/hooks";
import {Resource} from "../../generated/proposalToolSchemas.ts";
import AvailableResourcesModal from "./availableResources.modal.tsx";

export type AvailableResourcesProps  = {
    resource: Resource | undefined,
    closeModal?: () => void
}

export default function CycleAvailableResourcesPanel() : ReactElement {

    const {selectedCycleCode} = useParams();

    const availableResources =
        useAvailableResourcesResourceGetCycleAvailableResources({
        pathParams: {
            cycleCode: Number(selectedCycleCode)
        }
    });

    if (availableResources.error) {
        notifications.show({
            message: "cause " + getErrorMessage(availableResources.error),
            title: "Error loading available resources",
            autoClose: 5000,
            color: 'red'
        })
    }

    const AvailableResourcesRows = () => {
        return (
            availableResources.data?.resources?.map((resource) => {
                return (
                    <Table.Tr key={randomId()}>
                        <Table.Td>{resource.type?.name} </Table.Td>
                        <Table.Td>{resource.amount}</Table.Td>
                        <Table.Td>{resource.type?.unit}</Table.Td>
                    </Table.Tr>
                )
            })
        )
    }

    const AvailableResourceHeader = () => {
        return (
            <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Unit</Table.Th>
            </Table.Tr>
        )
    }

    return (
        <>
            <Table>
                <Table.Thead>
                    <AvailableResourceHeader/>
                </Table.Thead>
                <Table.Tbody>
                    <AvailableResourcesRows/>
                </Table.Tbody>
            </Table>
            <Group justify={"center"}>
                <AvailableResourcesModal resource={undefined} />
            </Group>
        </>
    )
}