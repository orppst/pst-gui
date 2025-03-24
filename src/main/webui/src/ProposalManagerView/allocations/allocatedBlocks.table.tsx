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

/*
    Always have a table for each distinct observing mode in a proposal.

    Each table shows a row for each available resource type in the proposal cycle.

    Freshly allocated proposals start with zero resources and may be allocated by
    the "edit" button.

    For each resource type the resource "totals" table should show total amount,
    amount used, and amount remaining for the cycle.

    Additionally, this should show the breakdown of amounts between different
    observing modes for the entire cycle.
 */


export type AllocatedBlocksTableProps = {
    proposalTitle: string,
    allocatedBlocks: AllocatedBlock[],
    allocatedProposalId: number,
    observingModeId: number,
    grades: AllocationGrade[],
    resourceTypes: ResourceType[],
}

export default function AllocatedBlocksTable(p: AllocatedBlocksTableProps): ReactElement {
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
        gradeName: string,
        allocatedId: number,
        blockId: number
    }

    const confirmDelete = (props: DeleteProps) => {
        modals.openConfirmModal({
            title: "Delete '" + props.resourceName + " 'grade' " + props.gradeName
                + "' from '" + props.proposalTitle + "'?",
            centered: true,
            children: (
                <Text size={"sm"}>
                    This will remove the '{props.resourceName}' grade '{props.gradeName}'
                    resource block from '{props.proposalTitle}'. Are you sure?
                </Text>
            ),
            labels: {confirm: "Delete", cancel: "No, don't delete it"},
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
                        "Deleted " + props.resourceName + " 'grade' " + props.gradeName
                        + " from " + props.proposalTitle))
            },
            onError: (error) =>
                notifyError("Failed to delete " + props.resourceName + " 'grade' " + props.gradeName +
                    " from " + props.proposalTitle, getErrorMessage(error))
        })
    }

    //check we have at least one block for the particular observing mode, we filter when rendering the rows
    let allocatedBlock = p.allocatedBlocks.find(ab => {
        return ab.mode?._id === p.observingModeId || ab.mode === p.observingModeId;
    })

    return (
        <Stack>
            {allocatedBlock && p.grades.length > 0 && p.resourceTypes.length > 0 &&
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Resource</Table.Th>
                            <Table.Th>Amount</Table.Th>
                            <Table.Th>Grade</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {
                         p.allocatedBlocks
                             .filter(ab => (ab.mode?._id === p.observingModeId
                                 || ab.mode === p.observingModeId))
                             .map(ab => {
                                 //the game here is called "Object or Reference: try not to blow yer leg off"
                                 let theGrade : AllocationGrade | undefined = ab.grade
                                 let theResourceType : ResourceType | undefined = ab.resource?.type

                                 if(theGrade && theGrade.name === undefined) {
                                     theGrade = p.grades.find(gr => gr._id == ab.grade)
                                 }

                                 if(theResourceType && theResourceType.name === undefined) {
                                     theResourceType = p.resourceTypes.find(rt =>
                                         rt._id == ab.resource?.type)
                                 }

                                 return (
                                    <Table.Tr key={ab._id}>
                                        <Table.Td>{theResourceType!.name}</Table.Td>
                                        <Table.Td>{ab.resource?.amount} {theResourceType!.unit}</Table.Td>
                                        <Table.Td>{theGrade!.name}</Table.Td>
                                        <Table.Td>
                                            <Group justify={"flex-end"}>
                                                <AllocatedBlockModal
                                                    proposalTitle={p.proposalTitle}
                                                    allocatedBlock={ab}
                                                    allocatedProposalId={p.allocatedProposalId}
                                                    observingModeId={p.observingModeId}
                                                />
                                                <DeleteButton
                                                    toolTipLabel={"delete this resource block"}
                                                    onClick={() => confirmDelete(
                                                        {
                                                            proposalTitle: p.proposalTitle,
                                                            resourceName: theResourceType!.name!,
                                                            gradeName: theGrade!.name!,
                                                            allocatedId: p.allocatedProposalId,
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
                    proposalTitle={p.proposalTitle}
                    allocatedProposalId={p.allocatedProposalId}
                    observingModeId={p.observingModeId}
                />
            }
        </Stack>
    )
}