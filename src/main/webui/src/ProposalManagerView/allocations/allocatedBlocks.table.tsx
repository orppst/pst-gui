import {AllocatedBlock, AllocationGrade, ResourceType} from "../../generated/proposalToolSchemas.ts";
import {Group, Stack, Table, Text} from "@mantine/core";
import DeleteButton from "../../commonButtons/delete.tsx";
import AllocatedBlockModal from "./allocatedBlock.modal.tsx";
import {ReactElement} from "react";
import {modals} from "@mantine/modals";
import {
    useAllocatedBlockResourceRemoveAllocatedBlock, //useAvailableResourcesResourceGetCycleResourceTypes
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export type AllocatedBlocksTableProps = {
    proposalTitle: string,
    allocatedBlocks: AllocatedBlock[],
    allocatedProposalId: number,
    observingModeId: number
}

export default function AllocatedBlocksTable(props: AllocatedBlocksTableProps): ReactElement {
    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

    // const cycleResourceTypes =
    //     useAvailableResourcesResourceGetCycleResourceTypes({
    //         pathParams: {cycleCode: Number(selectedCycleCode)}
    //     })

    const removeAllocatedBlock =
        useAllocatedBlockResourceRemoveAllocatedBlock();

    type DeleteProps = {
        proposalTitle: string,
        resourceName: string,
        allocatedId: number,
        blockId: number
    }

    const confirmDelete = (props: DeleteProps) => {
        modals.openConfirmModal({
            title: "Delete '" + props.resourceName + "' from '" + props.proposalTitle + "'?",
            centered: true,
            children: (
                <Text size={"sm"}>
                    This will remove the '{props.resourceName}' resource block from '{props.proposalTitle}'.
                    Are you sure?
                </Text>
            ),
            labels: {confirm: "Delete", cancel: "No, don't remove " + props.resourceName},
            confirmProps: {color: "red"},
            onConfirm: () => handleDelete({...props})
        })
    }

    const handleDelete = (props: DeleteProps) => {
        removeAllocatedBlock.mutate({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                allocatedId: props.allocatedId,
                blockId: props.blockId
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() => notifySuccess("Deletion Successful",
                        "Deleted " + props.resourceName + " from " + props.proposalTitle))
            },
            onError: (error) =>
                notifyError("Failed to delete " + props.resourceName +
                    " from " + props.proposalTitle, getErrorMessage(error))
        })
    }

    let grades: AllocationGrade[] = [];
    let resourceTypes: ResourceType[] = [];

    return (
        <Stack>
            {props.allocatedBlocks.length > 0 &&
                <Table c={"orange"}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Resource</Table.Th>
                            <Table.Th>Amount</Table.Th>
                            <Table.Th>Grade</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody c={"orange.2"}>
                        {
                         props.allocatedBlocks.map(ab => {
                             //on subsequent calls for the same "thing" we get a reference rather than the "thing"
                             //store the "thing" on first call, find it on subsequent calls for the same "thing"
                             if(ab.grade?.name != undefined)
                                grades.push(ab.grade)
                             else
                                ab.grade = grades.find(gr => gr._id == ab.grade)

                             if(ab.resource?.type?.name != undefined)
                                resourceTypes.push(ab.resource.type)
                             else if(ab.resource != undefined)
                                 ab.resource.type = resourceTypes.find(rt => rt._id == ab.resource?.type)

                             return (
                                <Table.Tr key={ab._id}>
                                    <Table.Td>{ab.resource?.type?.name}</Table.Td>
                                    <Table.Td>{ab.resource?.amount} {ab.resource?.type?.unit}</Table.Td>
                                    <Table.Td>{ab.grade?.name}</Table.Td>
                                    <Table.Td>
                                        <Group justify={"flex-end"}>
                                            <AllocatedBlockModal
                                                proposalTitle={props.proposalTitle}
                                                allocatedBlock={ab}
                                                allocatedProposalId={props.allocatedProposalId}
                                                observingModeId={props.observingModeId}
                                            />
                                            <DeleteButton
                                                toolTipLabel={"delete this resource block"}
                                                onClick={() => confirmDelete(
                                                    {
                                                        proposalTitle: props.proposalTitle,
                                                        resourceName: ab.resource?.type?.name!,
                                                        allocatedId: props.allocatedProposalId,
                                                        blockId: ab._id!
                                                    }
                                                )}
                                            />
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            )
                        })}
                    </Table.Tbody>
                </Table>
            }
            {
                <AllocatedBlockModal
                    proposalTitle={props.proposalTitle}
                    allocatedProposalId={props.allocatedProposalId}
                    observingModeId={props.observingModeId}
                />
            }


        </Stack>
    )
}