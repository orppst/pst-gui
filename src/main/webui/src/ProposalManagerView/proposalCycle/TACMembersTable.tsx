import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {
    useTACResourceGetCommitteeMember,
    useTACResourceGetCommitteeMembers
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export default function TACMembersTable(selectedCycleCode: number) : ReactElement {

    const tacMembers = useTACResourceGetCommitteeMembers(
        {pathParams:{cycleCode: selectedCycleCode}}
    )

    if (tacMembers.error) {
        notifyError("Failed to load tac members list",
            "cause: " + getErrorMessage(tacMembers.error))
    }

    const TACMembersTableHeader = () : ReactElement => {
        return(
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Organisation</Table.Th>
                </Table.Tr>
            </Table.Thead>
        )
    }

    const TACMembersTableBody = () : ReactElement => {
        return(
            <Table.Tbody>
                {tacMembers.data?.map((member) => {
                    return TacMembersTableRow(member.dbid!)
                })}
            </Table.Tbody>
        )
    }

    const TacMembersTableRow = (id: number) : ReactElement => {

        const tacMember = useTACResourceGetCommitteeMember(
            {pathParams:{cycleCode: selectedCycleCode, memberId: id}}
        )

        if (tacMember.error) {
            notifyError("Failed to load TAC member id " + id,
                "cause: " + getErrorMessage(tacMember.error))
        }

        return (
            <Table.Tr key={String(id)}>
                <Table.Td>{tacMember.data?.member?.person?.fullName}</Table.Td>
                <Table.Td>{tacMember.data?.role}</Table.Td>
                <Table.Td>{tacMember.data?.member?.person?.homeInstitute?.name}</Table.Td>
            </Table.Tr>
        )
    }

    return (
        <Table>
            <TACMembersTableHeader />
            <TACMembersTableBody />
        </Table>
    )
}