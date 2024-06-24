import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {Group, Stack, Table} from "@mantine/core";
import DeleteButton from "../../commonButtons/delete.tsx";
import AllocatedBlockModal from "./allocatedBlock.modal.tsx";
import {ReactElement} from "react";

export type AllocatedBlocksTableProps = {
    proposalTitle: string,
    allocatedBlocks: AllocatedBlock[],
    allocatedProposalId: number
}

export default
function AllocatedBlocksTable(props: AllocatedBlocksTableProps): ReactElement
{
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