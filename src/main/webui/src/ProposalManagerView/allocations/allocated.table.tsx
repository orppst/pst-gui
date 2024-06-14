import {ReactElement} from "react";
import {Table} from "@mantine/core";

type AllocatedTableRowProps = {
    cycleCode: number,
    allocatedProposalId: number
}

function AllocatedTableRow(proposalTitle: string) : ReactElement {


    return (
        <Table.Tr>
            <Table.Td>{proposalTitle}</Table.Td>
            <Table.Td>button to edit</Table.Td>
        </Table.Tr>
    )
}


export default
function AllocatedTable() : ReactElement {




    const header = () => (
        <Table.Tr>
            <Table.Th>Proposal Title</Table.Th>
            <Table.Th></Table.Th>
        </Table.Tr>
    )

    return(
        <Table>

        </Table>
    )
}