import {ReactElement} from "react";
import {Group, Table} from "@mantine/core";
import {
    useAvailableResourcesResourceGetCycleAvailableResources,
    useResourceTypeResourceGetAllResourceTypes
} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {randomId} from "@mantine/hooks";
import {Resource} from "../../generated/proposalToolSchemas.ts";
import AvailableResourcesModal from "./availableResources.modal.tsx";

/*
get all resource types in the database, compare to the resource types already used in this cycle,
if all resource types have been used disable the "Add" button. Compare lengths of lists.
 */


export type AvailableResourcesProps  = {
    resource: Resource | undefined,
    closeModal?: () => void,
    disableAdd?: boolean
}

export default function CycleAvailableResourcesPanel() : ReactElement {

    const {selectedCycleCode} = useParams();

    const availableResources =
        useAvailableResourcesResourceGetCycleAvailableResources({
        pathParams: {
            cycleCode: Number(selectedCycleCode)
        }
    });

    const resourceTypes =
        useResourceTypeResourceGetAllResourceTypes({});


    if (availableResources.error) {
        notifications.show({
            message: "cause " + getErrorMessage(availableResources.error),
            title: "Error loading available resources",
            autoClose: 5000,
            color: 'red'
        })
    }

    if (resourceTypes.error) {
        notifications.show({
            message: "cause: " + getErrorMessage(resourceTypes.error),
            title: "Error loading resource types",
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

    //<AvailableResourceModal resource={undefined} /> can be treated as an alias
    //for the "Add" button. We want to disable it if the number of available resources
    //in this Cycle equals the total number of resource types added to the Tool.
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
                <AvailableResourcesModal
                    resource={undefined}
                    disableAdd={resourceTypes.data?.length ==
                        availableResources.data?.resources?.length}
                />
            </Group>
        </>
    )
}