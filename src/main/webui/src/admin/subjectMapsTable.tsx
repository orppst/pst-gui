import {ReactElement} from "react";
import {Table} from "@mantine/core"
import {SubjectMap} from "../generated/proposalToolSchemas.ts";

export type SubjectMapRowProps = {
    subjectMap: SubjectMap,
    inKeycloak: Boolean
}


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

export default function SubjectMapRow(rowProps : SubjectMapRowProps) : ReactElement {
    return (
        <Table.Tr bg={rowProps.inKeycloak ? "green.9" : "orange.9"}>
            <Table.Td>{rowProps.subjectMap.person?.fullName}</Table.Td>
            <Table.Td>{rowProps.subjectMap.person?.eMail}</Table.Td>
            <Table.Td>{rowProps.subjectMap.person?.homeInstitute?.name}</Table.Td>
        </Table.Tr>
    )
}
