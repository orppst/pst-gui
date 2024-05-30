import {ReactElement} from "react";
import {Group, Table, Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    fetchProposalResourceRemoveField,
    useProposalResourceGetField,
    useProposalResourceGetFields
} from "../../generated/proposalToolComponents.ts";
import ObservationFieldModal from "./observationFields.modal.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import DeleteButton from "../../commonButtons/delete.tsx";
import {modals} from "@mantine/modals";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {ObservationFieldsTableProps} from "./ObservationFieldsPanel.tsx";


type ObservationFieldRowProps = {
    proposalCode: number,
    fieldId: number,
    disableDelete: boolean
}

function ObservationFieldsRow(props: ObservationFieldRowProps): ReactElement {
    const field = useProposalResourceGetField({
        pathParams:{
            proposalCode: props.proposalCode,
            fieldId: props.fieldId
        }
    })

    const queryClient = useQueryClient();

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

    const handleDelete = () => {
        fetchProposalResourceRemoveField({
            pathParams: {
                proposalCode: props.proposalCode,
                fieldId: props.fieldId
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess("Deleted Successfully",
                "the field has been removed"))
            .catch(error => notifyError("Deletion Failed",
                getErrorMessage(error)))
    }

    const confirmDeletion = () => modals.openConfirmModal({
        title: "Delete Field?",
        children: (
            <Text c={"yellow"} size={"sm"}>
                This will remove the "{field.data.name}" Observation Field from this Proposal
            </Text>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm() {handleDelete()}
    })


    let typeName = field.data["@type"]

    return (
        <Table.Tr key={props.fieldId}>
            <Table.Td>{field.data.name}</Table.Td>
            <Table.Td>{typeName?.slice(typeName?.indexOf(":") + 1)}</Table.Td>
            <Table.Td c={"blue"}>not yet implemented</Table.Td>
            <Table.Td c={"gray"}>
                <Group justify={"flex-end"}>
                    <ObservationFieldModal observationField={field.data} />
                    <DeleteButton
                        disabled={props.disableDelete}
                        toolTipLabel={props.disableDelete ?
                            "Delete disabled, Field in use by an observation" :
                            "Remove this Field from the Proposal"}
                        onClick={confirmDeletion}
                    />
                </Group>
            </Table.Td>
        </Table.Tr>
    )
}

export default function ObservationFieldsTable(props: ObservationFieldsTableProps) : ReactElement {

    const {selectedProposalCode} = useParams();
    const fields = useProposalResourceGetFields({
        pathParams:{proposalCode: Number(selectedProposalCode)}
    })

    //returns true if a field is currently "bound" to an observation
    const isFieldBound = (fieldId : number) : boolean => {
        return props.boundFields ? props.boundFields.includes(fieldId) : false
    }

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
                        disableDelete={isFieldBound(fieldId.dbid!)}
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