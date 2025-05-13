import {ReactElement} from "react";
import { WhichJustification} from "./JustificationsPanel.tsx";
import {Justification} from "src/generated/proposalToolSchemas.ts";
import {Loader, Table} from "@mantine/core";
import JustificationsEditModal from "./edit.modal.tsx";
import {
    useJustificationsResourceCheckForMainFile,
    useJustificationsResourceGetLatexResourceFiles
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export type JustificationProps = {
    which : WhichJustification,
    justification: Justification,
    resourceFiles: string[],
    hasMain: Boolean,
    closeModal?: () => void
}

export default
function JustificationsTable(justifications: {scientific: Justification, technical: Justification})
    : ReactElement {

    const { selectedProposalCode } = useParams();

    const scientificResourceFiles = useJustificationsResourceGetLatexResourceFiles({
        pathParams: {proposalCode: Number(selectedProposalCode), which: 'scientific'}
    })

    const scientificHasMain = useJustificationsResourceCheckForMainFile({
        pathParams: {proposalCode: Number(selectedProposalCode), which: 'scientific'}
    })

    const technicalResourceFiles = useJustificationsResourceGetLatexResourceFiles({
        pathParams: {proposalCode: Number(selectedProposalCode), which: 'technical'}
    })

    const technicalHasMain = useJustificationsResourceCheckForMainFile({
        pathParams: {proposalCode: Number(selectedProposalCode), which: 'technical'}
    })

    if (scientificResourceFiles.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load scientific resource files"}
                error={getErrorMessage(scientificResourceFiles.error)}
            />
        )
    }

    if (technicalResourceFiles.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load technical resource files"}
                error={getErrorMessage(technicalResourceFiles.error)}
            />
        )
    }

    if (scientificHasMain.isError) {
        return (
            <AlertErrorMessage
                title={"Failed on scientific has-main check"}
                error={getErrorMessage(scientificHasMain.error)}
            />
        )
    }

    if (technicalHasMain.isError) {
        return (
            <AlertErrorMessage
                title={"Failed on technical has-main check"}
                error={getErrorMessage(technicalHasMain.error)}
            />
        )
    }

    if (scientificResourceFiles.isLoading || technicalResourceFiles.isLoading
        || scientificHasMain.isLoading || technicalHasMain.isLoading) {
        return <Loader/>
    }


    const justificationsHeader = () : ReactElement => {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Justification</Table.Th>
                    <Table.Th>Text Format</Table.Th>
                    <Table.Th>Main File?</Table.Th>
                    <Table.Th>Resource files</Table.Th>
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
                    <Table.Td>{justifications.scientific.format}</Table.Td>
                    <Table.Td>{scientificHasMain.data as unknown as Boolean ? 'Yes' : 'No'}</Table.Td>
                    <Table.Td>{scientificResourceFiles.data?.length}</Table.Td>
                    <Table.Td>
                        <JustificationsEditModal
                            which={'scientific'}
                            justification={justifications.scientific}
                            resourceFiles={scientificResourceFiles.data!}
                            hasMain={scientificHasMain.data as unknown as Boolean}
                        />
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Technical</Table.Td>
                    <Table.Td>{justifications.technical.format}</Table.Td>
                    <Table.Td>{technicalHasMain.data as unknown as Boolean ? 'Yes' : 'No'}</Table.Td>
                    <Table.Td>{technicalResourceFiles.data?.length}</Table.Td>
                    <Table.Td>
                        <JustificationsEditModal
                            which={'technical'}
                            justification={justifications.technical}
                            resourceFiles={technicalResourceFiles.data!}
                            hasMain={technicalHasMain.data as unknown as Boolean}
                        />
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