import {ReactElement} from "react";
import {Badge, Group, Table} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {AllocatedBlock, ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ViewEditButton from "../../commonButtons/viewEdit.tsx";

type AllocatedTableRowProps = {
    cycleCode: number,
    allocatedProposalId: number
}

function AllocatedTableRow(props: AllocatedTableRowProps) : ReactElement {

    const allocatedProposal =
        useAllocatedProposalResourceGetAllocatedProposal({
            pathParams: {
                cycleCode: props.cycleCode,
                allocatedId: props.allocatedProposalId
            }
        })

    if (allocatedProposal.isLoading) {
        return (
            <></>
        )
    }

    if (allocatedProposal.error) {
        notifyError("Failed to load Allocated Proposal",
            getErrorMessage(allocatedProposal.error))
    }



    //a nested table
    const allocatedBlocksTable = (allocatedBlocks: AllocatedBlock[]) => (
        <Table c={"orange"} fz={"xs"}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Resource</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Mode</Table.Th>
                    <Table.Th>Grade</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody c={"orange.2"}>
                {allocatedBlocks.map(ab => (
                    //resource.type.name + grade is unique per row in this table
                    <Table.Tr key={ab.resource?.type?.name! + ab.grade?.name!}>
                        <Table.Td>{ab.resource?.type?.name}</Table.Td>
                        <Table.Td>{ab.resource?.amount} {ab.resource?.type?.unit}</Table.Td>
                        <Table.Td>{ab.mode?.name}</Table.Td>
                        <Table.Td>{ab.grade?.name}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )

    return (
        <Table.Tr>
            <Table.Td>{allocatedProposal.data?.submitted?.proposal?.title}</Table.Td>
            <Table.Td>{
                allocatedProposal.data?.allocation &&
                allocatedProposal.data.allocation.length > 0 ?
                    allocatedBlocksTable(allocatedProposal.data.allocation)
                    :
                    <Group justify={"center"}>
                        <Badge bg={"red"} radius={"sm"}>
                            No blocks allocated
                        </Badge>
                    </Group>
            }</Table.Td>
            <Table.Td>
                <Group justify={"center"}>
                    <ViewEditButton
                        toolTipLabel={"edit allocated blocks"}
                        label={"Edit"}
                    />
                </Group>
            </Table.Td>
        </Table.Tr>
    )
}


export default
function AllocatedTable(props: {allocatedIds: ObjectIdentifier[]}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const header = () => (
        <Table.Tr>
            <Table.Th>Proposal Title</Table.Th>
            <Table.Th>Allocated Blocks</Table.Th>
            <Table.Th></Table.Th>
        </Table.Tr>
    )

    return(
        <Table withColumnBorders>
            <Table.Thead>
                {header()}
            </Table.Thead>
            <Table.Tbody>
                {props.allocatedIds.map(ap =>(
                    <AllocatedTableRow
                        key={ap.dbid}
                        cycleCode={Number(selectedCycleCode)}
                        allocatedProposalId={ap.dbid!}
                    />
                ))}
            </Table.Tbody>
        </Table>
    )
}