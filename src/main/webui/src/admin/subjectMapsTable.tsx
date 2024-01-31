import {ReactElement} from "react";
import {Table} from "@mantine/core"
import {SubjectMap} from "../generated/proposalToolSchemas.ts";

export function subjectMapsTableHeader() : ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Full Name</Table.Th>
                <Table.Th>email</Table.Th>
                <Table.Th>Organisation</Table.Th>
            </Table.Tr>
        </Table.Thead>
    )
}

export default function SubjectMapRow(subjectMap: SubjectMap) : ReactElement {
    return (
        <Table.Tr bg={subjectMap.inKeycloakRealm ? "green.9" : "orange.9"}>
            <Table.Td>{subjectMap.person?.fullName}</Table.Td>
            <Table.Td>{subjectMap.person?.eMail}</Table.Td>
            <Table.Td>{subjectMap.person?.homeInstitute?.name}</Table.Td>
        </Table.Tr>
    )
}
