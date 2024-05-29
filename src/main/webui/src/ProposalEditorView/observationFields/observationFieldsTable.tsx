import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useProposalResourceGetField, useProposalResourceGetFields} from "../../generated/proposalToolComponents.ts";
import ObservationFieldModal from "./observationFields.modal.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


type ObservationFieldRowProps = {
    proposalCode: number,
    fieldId: number,
}

function ObservationFieldsRow(props: ObservationFieldRowProps): ReactElement {
    const field = useProposalResourceGetField({
        pathParams:{
            proposalCode: props.proposalCode,
            fieldId: props.fieldId
        }
    })

    if (field.isError) {
        return (
            <Table.Tr key={props.fieldId}>
                Error: {getErrorMessage(field.error)}
            </Table.Tr>
        )
    }

    if (field.isLoading) {
        return (
            <Table.Tr key={props.fieldId}>
                Loading...
            </Table.Tr>
        )
    }

    let typeName = field.data["@type"]

    return (
        <Table.Tr key={props.fieldId}>
            <Table.Td>{field.data.name}</Table.Td>
            <Table.Td>{typeName?.slice(typeName?.indexOf(":") + 1)}</Table.Td>
            <Table.Td c={"blue"}>not yet implemented</Table.Td>
            <Table.Td c={"gray"}>
                <ObservationFieldModal observationField={field.data} />
            </Table.Td>
        </Table.Tr>
    )
}

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
                fields.data?.map(fieldId => (
                    <ObservationFieldsRow
                        fieldId={fieldId.dbid!}
                        proposalCode={Number(selectedProposalCode)}
                    />
                ))
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