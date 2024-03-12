import {ReactElement} from "react";
import {JustificationKinds} from "./JustificationsPanel.tsx";
import {useForm, UseFormReturnType} from "@mantine/form";
import {Justification, TextFormats} from "../generated/proposalToolSchemas.ts";
import {Table} from "@mantine/core";
import JustificationsEditModal from "./edit.modal.tsx";


export type Which = 'scientific' | 'technical';

export type JustificationProps = {
    which : Which,
    form: UseFormReturnType<Justification>
    closeModal?: () => void
}

export default function JustificationsTable(justifications: JustificationKinds)
    : ReactElement {

    const DEFAULT_JUSTIFICATION : Justification = {text: "", format: "ASCIIDOC" };

    const scientificForm: UseFormReturnType<Justification> =
        useForm<Justification>({
            initialValues: justifications.scientific ?? DEFAULT_JUSTIFICATION ,
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty for a Scientific Justification" : null),
                format: (value: TextFormats | undefined ) =>
                    (value !== "LATEX" && value !== "RST" && value !== "ASCIIDOC" ?
                        'Text format one of: LATEX, RST, or ASCIIDOC' : null)
            }
        });

    const technicalForm: UseFormReturnType<Justification> =
        useForm<Justification>({
            initialValues: justifications.technical ?? DEFAULT_JUSTIFICATION ,
            validate: {
                text: (value: string | undefined) =>
                    (value === "" || value === undefined ?
                        "Text cannot be empty for a Technical Justification" : null),
                format: (value: TextFormats | undefined ) =>
                    (value !== "LATEX" && value !== "RST" && value !== "ASCIIDOC" ?
                        'Text format one of: LATEX, RST, or ASCIIDOC' : null)
            }
        });

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
                    <Table.Td>{scientificForm.values.format}</Table.Td>
                    <Table.Td>
                        <JustificationsEditModal which={'scientific'} form={scientificForm}/>
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Technical</Table.Td>
                    <Table.Td>???</Table.Td>
                    <Table.Td>{technicalForm.values.format}</Table.Td>
                    <Table.Td>
                        <JustificationsEditModal which={'technical'} form={technicalForm}/>
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