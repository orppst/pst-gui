import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal,
    useAllocatedProposalResourceGetAllocatedProposals
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

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
                    //resource.name.type is unique per row in this table
                    <Table.Tr key={ab.resource?.type?.name}>
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
            <Table.Td>{allocatedBlocksTable(allocatedProposal.data?.allocation!)}</Table.Td>
            <Table.Td>button to edit</Table.Td>
        </Table.Tr>
    )
}


export default
function AllocatedTable() : ReactElement {

    const {selectedCycleCode} = useParams();

    const allocatedProposals =
        useAllocatedProposalResourceGetAllocatedProposals({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

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
                {allocatedProposals.data?.map(ap =>(
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