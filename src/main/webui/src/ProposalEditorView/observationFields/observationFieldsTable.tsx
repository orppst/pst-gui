import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useProposalResourceGetFields} from "../../generated/proposalToolComponents.ts";


export default function ObservationFieldsTable() : ReactElement {

    const {selectedProposalCode} = useParams();
    const fields = useProposalResourceGetFields({
        pathParams:{proposalCode: Number(selectedProposalCode)}
    })



    const fieldsTableHeader = () => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Properties</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const fieldsTableBody = () => (
        <Table.Tbody>
            {
                fields.data?.map(field => {
                    return (
                        <Table.Tr key={field.dbid}>
                            <Table.Td>{field.name}</Table.Td>
                            <Table.Td c={"blue"}>not yet implemented</Table.Td>
                            <Table.Td c={"blue"}>not yet implemented</Table.Td>
                            <Table.Td c={"gray"}>control buttons here</Table.Td>
                        </Table.Tr>
                    )
                })
            }
        </Table.Tbody>
    )

    return(
        <Table>
            {fieldsTableHeader()}
            {fieldsTableBody()}
        </Table>
    )
}