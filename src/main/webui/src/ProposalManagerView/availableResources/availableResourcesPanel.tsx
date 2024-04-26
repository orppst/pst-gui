import {ReactElement} from "react";
import {Box, Group, Table, Text} from "@mantine/core";
import {
    fetchAvailableResourcesResourceRemoveCycleResource,
    useAvailableResourcesResourceGetCycleAvailableResources,
    useResourceTypeResourceGetAllResourceTypes
} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {Resource} from "../../generated/proposalToolSchemas.ts";
import AvailableResourcesModal from "./availableResources.modal.tsx";
import DeleteButton from "../../commonButtons/delete.tsx";
import {modals} from "@mantine/modals";
import {useQueryClient} from "@tanstack/react-query";


export type AvailableResourcesProps  = {
    resource: Resource | undefined,
    closeModal?: () => void,
    disableAdd?: boolean
}

export default function CycleAvailableResourcesPanel() : ReactElement {

    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

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

    const handleDelete = (id: number) => {
        fetchAvailableResourcesResourceRemoveCycleResource({
            pathParams:{
                cycleCode: Number(selectedCycleCode),
                resourceId: id
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(()=>{
                notifications.show({
                    autoClose: 5000,
                    title: "Available Resource Deleted",
                    message: "The selected available resource has been removed",
                    color: "green"
                })
            })
            .catch((error) => {
                notifications.show({
                    autoClose: 5000,
                    title: "Deletion Failed",
                    message: "Unable to remove the selected available resource, cause: "
                        + getErrorMessage(error),
                    color: 'red'
                })
            })
    }

    const confirmDelete = (resource: Resource): void => modals.openConfirmModal({
        title: 'Delete Available Resource?',
        children: (
            <Text c={"yellow"} size={"sm"}>
                Resource: {resource.type!.name}
            </Text>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm: () => handleDelete(resource._id!),
        onCancel: () => console.log('Cancel delete'),
    })


    //<AvailableResourceModal resource={resource} /> can be treated as an alias for the "Edit" button
    const AvailableResourcesRows = () => {
        return (
            availableResources.data?.resources?.map((resource) => {
                return (
                    <Table.Tr key={resource._id}>
                        <Table.Td>{resource.type?.name} </Table.Td>
                        <Table.Td>{resource.amount}</Table.Td>
                        <Table.Td>{resource.type?.unit}</Table.Td>
                        <Table.Td>
                            <Group justify={"flex-end"}>
                                <AvailableResourcesModal resource={resource} />
                                <DeleteButton
                                    toolTipLabel={"delete resource"}
                                    onClick={() => confirmDelete(resource)}
                                />
                            </Group>
                        </Table.Td>
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
                <Table.Th></Table.Th>
            </Table.Tr>
        )
    }

    //<AvailableResourceModal resource={undefined} /> can be treated as an alias
    //for the "Add" button. We want to disable it if the number of available resources
    //in this Cycle equals the total number of resource types added to the Tool.
    return (
        <Box>
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
        </Box>
    )
}