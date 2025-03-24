import {ReactElement} from "react";
import {Fieldset, Grid, Group, Space, Stack, Table, Text} from "@mantine/core";
import {
    useAvailableResourcesResourceGetCycleAvailableResources,
    useAvailableResourcesResourceGetCycleResourceTypes,
    useAvailableResourcesResourceRemoveCycleResource
} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {Resource} from "../../generated/proposalToolSchemas.ts";
import AvailableResourcesModal from "./availableResources.modal.tsx";
import DeleteButton from "../../commonButtons/delete.tsx";
import {modals} from "@mantine/modals";
import {useQueryClient} from "@tanstack/react-query";
import ResourceTypeModal from "./resourceType.modal.tsx";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {HaveRole} from "../../auth/Roles.tsx";


export type AvailableResourcesProps  = {
    resource: Resource | undefined,
    closeModal?: () => void,
    disableAdd?: boolean
}

export type ResourceTypeProps = {
    resourceTypeId: number | undefined,
    closeModal?: () => void,
    disableAdd?: boolean
}

export default function CycleAvailableResourcesPanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

    const removeCycleResource =
        useAvailableResourcesResourceRemoveCycleResource();

    const availableResources =
        useAvailableResourcesResourceGetCycleAvailableResources({
        pathParams: {cycleCode: Number(selectedCycleCode)}
    });

    const cycleResourceTypes =
        useAvailableResourcesResourceGetCycleResourceTypes({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    if (availableResources.error) {
        notifyError("Error loading available resources", getErrorMessage(availableResources.error));
    }

    if (cycleResourceTypes.error) {
        notifyError("Error loading resource types", getErrorMessage(cycleResourceTypes.error));
    }

    const handleDelete = (id: number) => {
        removeCycleResource.mutate({
            pathParams:{
                cycleCode: Number(selectedCycleCode),
                resourceId: id
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() =>
                        notifySuccess("Available Resource Deleted",
                            "The selected available resource has been removed")
                    )
            },
            onError: (error) =>
                notifyError("Deletion Failed", getErrorMessage(error))

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


    const AllResourceTypesTextLinks = () => {
        return (
            cycleResourceTypes.data?.map((rType) => {

                let textColour : string = 'green';

                    if(availableResources.data !== undefined
                        && availableResources.data.resources !== undefined
                        && availableResources.data?.resources!.find(res => res.type!._id == rType.dbid ))
                            textColour = 'orange';

                return (
                    <Text key={rType.dbid} c={textColour}>
                        {rType.name}
                    </Text>
                )
            })
        )
    }


    //<AvailableResourceModal resource={resource} /> can be treated as an alias for the "Edit" button
    const AvailableResourcesRows = () => {
        if(availableResources.data === undefined || availableResources.data.resources === undefined) {
            return (<Table.Tr><Table.Td>No resources!</Table.Td></Table.Tr>);
        } else
        return (
            availableResources.data?.resources?.map((resource) => (
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
            ))
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
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Available Resources"} />
            <Space h={"xl"}/>
            <Grid columns={10}>
                <Grid.Col span={7}>
                    <Fieldset legend={"Current Resource Amounts"}>
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
                                disableAdd={cycleResourceTypes.data?.length ==
                                    availableResources.data?.resources?.length}
                            />
                        </Group>
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={3}>
                    <Fieldset legend={"Defined Resource Types"}>
                        <Stack gap={"xs"}>
                            <AllResourceTypesTextLinks />
                        </Stack>

                        <Group justify={"center"}>
                            <ResourceTypeModal resourceTypeId={undefined}/>
                        </Group>

                    </Fieldset>
                </Grid.Col>
            </Grid>
        </PanelFrame>
    )
}