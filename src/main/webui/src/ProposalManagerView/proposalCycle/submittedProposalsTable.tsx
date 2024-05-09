import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {useSubmittedProposalResourceGetSubmittedProposals} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */

export default function SubmittedProposalsTable(selectedCycleCode: number) : ReactElement {

    const submittedProposals = useSubmittedProposalResourceGetSubmittedProposals(
        {pathParams:{cycleCode: selectedCycleCode}}
    )

    if (submittedProposals.error) {
        notifyError("Failed to load submitted proposals list",
            "cause: " + getErrorMessage(submittedProposals.error))
    }

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
                {submittedProposals.data?.map((sp) => (
                    <Table.Tr key={String(sp.dbid)}>
                        <Table.Td>{sp.name}</Table.Td>
                        <Table.Td c={"blue"}>{"not yet implemented"}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        )
    }

    return (
        <Table>
            <SubmittedProposalsTableHeader />
            <SubmittedProposalsTableBody />
        </Table>
    )
}