import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {Group, Stack, Table, Text} from "@mantine/core";
import DeleteButton from "../../commonButtons/delete.tsx";
import AllocatedBlockModal from "./allocatedBlock.modal.tsx";
import {ReactElement} from "react";
import {modals} from "@mantine/modals";
import {fetchAllocatedBlockResourceRemoveAllocatedBlock} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export type AllocatedBlocksTableProps = {
    proposalTitle: string,
    allocatedBlocks: AllocatedBlock[],
    allocatedProposalId: number
}

export default
function AllocatedBlocksTable(props: AllocatedBlocksTableProps): ReactElement
{
    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

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
            children:(
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
        fetchAllocatedBlockResourceRemoveAllocatedBlock({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                allocatedId: props.allocatedId,
                blockId: props.blockId
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess("Deletion Successful",
                "Deleted " + props.resourceName + " from " + props.proposalTitle))
            .catch(error => notifyError("Failed to delete " + props.resourceName +
                " from " + props.proposalTitle, getErrorMessage(error)))
    }

    return (
        <Stack>
            {props.allocatedBlocks.length > 0 &&
                <Table c={"orange"}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Resource</Table.Th>
                            <Table.Th>Amount</Table.Th>
                            <Table.Th>Mode</Table.Th>
                            <Table.Th>Grade</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody c={"orange.2"}>
                        {props.allocatedBlocks.map(ab => (
                            //resource.type.name + grade is unique per row in this table
                            <Table.Tr key={ab.resource?.type?.name! + ab.grade?.name!}>
                                <Table.Td>{ab.resource?.type?.name}</Table.Td>
                                <Table.Td>{ab.resource?.amount} {ab.resource?.type?.unit}</Table.Td>
                                <Table.Td>{ab.mode?.name}</Table.Td>
                                <Table.Td>{ab.grade?.name}</Table.Td>
                                <Table.Td>
                                    <Group justify={"flex-end"}>
                                        <AllocatedBlockModal
                                            proposalTitle={props.proposalTitle}
                                            allocatedBlock={ab}
                                            allocatedProposalId={props.allocatedProposalId}
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
                        ))}
                    </Table.Tbody>
                </Table>
            }
            <AllocatedBlockModal
                proposalTitle={props.proposalTitle}
                allocatedProposalId={props.allocatedProposalId}
            />
        </Stack>
    )
}