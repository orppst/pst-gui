import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */

export default function
    SubmittedProposalsTable(submittedProposals: ObjectIdentifier[]) :
    ReactElement {



    const SubmittedProposalsTableHeader = () : ReactElement => {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Proposal Title</Table.Th>
                    <Table.Th>Current Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
        )
    }

    const SubmittedProposalsTableBody = () : ReactElement => {
        return (
            <Table.Tbody>
                {submittedProposals.map((sp) => (
                    <Table.Tr key={String(sp.dbid)}>
                        <Table.Td>{sp.name}</Table.Td>
                        <Table.Td c={"blue"}>{"not yet implemented"}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        )
    }

    return (
        <Table
            stickyHeader
        >
            <SubmittedProposalsTableHeader />
            <SubmittedProposalsTableBody />
        </Table>
    )
}