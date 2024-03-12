import {ReactElement} from "react";
import {JustificationKinds} from "./JustificationsPanel.tsx";
import {Justification} from "../generated/proposalToolSchemas.ts";
import {Table} from "@mantine/core";
import JustificationsEditModal from "./edit.modal.tsx";

export type JustificationProps = {
    which : 'scientific' | 'technical',
    justification: Justification,
    closeModal?: () => void
}

export default function JustificationsTable(justifications: JustificationKinds)
    : ReactElement {

    const justificationsHeader = () : ReactElement => {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Justification</Table.Th>
                    <Table.Th>Word Count</Table.Th>
                    <Table.Th>Text Format</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
        )
    }

    //Notice there are only two rows here, scientific justification and technical justification
    //this is unlikely to change.
    const justificationsBody = () : ReactElement => {
        return (
            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>Scientific</Table.Td>
                    <Table.Td>???</Table.Td>
                    <Table.Td>{justifications.scientific.format}</Table.Td>
                    <Table.Td>
                        <JustificationsEditModal which={'scientific'} justification={justifications.scientific}/>
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Technical</Table.Td>
                    <Table.Td>???</Table.Td>
                    <Table.Td>{justifications.technical.format}</Table.Td>
                    <Table.Td>
                        <JustificationsEditModal which={'technical'} justification={justifications.technical}/>
                    </Table.Td>
                </Table.Tr>
            </Table.Tbody>
        )
    }

    return (
        <Table>
            {justificationsHeader()}
            {justificationsBody()}
        </Table>
    )
}