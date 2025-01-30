import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {Group, Stack, Table, Text} from "@mantine/core";
import DeleteButton from "../../commonButtons/delete.tsx";
import AllocatedBlockModal from "./allocatedBlock.modal.tsx";
import {ReactElement} from "react";
import {modals} from "@mantine/modals";
import {
    useAllocatedBlockResourceRemoveAllocatedBlock
} from "../../generated/proposalToolComponents.ts";
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
                        {props.allocatedBlocks.map(ab => {
                            //on second call for a "thing" we get a reference rather than the "thing"
                            // e.g., a resource name will only display once for the entire table.
                            console.log(ab)
                            return (
                                <Table.Tr key={ab._id}>
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
                            )
                        })}
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