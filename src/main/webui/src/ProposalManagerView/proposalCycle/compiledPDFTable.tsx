import {ReactElement, useState} from "react";
import {Table} from "@mantine/core";
import {
    fetchJustificationsResourceDownloadLatexPdf,
    useSubmittedProposalResourceGetSubmittedProposals
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {Button} from "semantic-ui-react";
import {IconPdf} from "@tabler/icons-react";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */

export default function DownloadCompiledPDFTable(selectedCycleCode: number) : ReactElement {

    const submittedProposals = useSubmittedProposalResourceGetSubmittedProposals(
        {pathParams:{cycleCode: selectedCycleCode}}
    )

    if (submittedProposals.error) {
        notifyError("Failed to load submitted proposals list",
            "cause: " + getErrorMessage(submittedProposals.error))
    }

    const CompiledPDFTableHeader = () : ReactElement => {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Proposal Title</Table.Th>
                    <Table.Th>Download Available</Table.Th>
                </Table.Tr>
            </Table.Thead>
        )
    }

    const [pdfDownLoad, setPdfDownload] = useState("");
    const [downloadReady, setDownloadReady] = useState(false);
    const LinkToDownload = () => {
        fetchJustificationsResourceDownloadLatexPdf({
            ...fetcherOptions,
            pathParams: {proposalCode: Number(selectedProposalCode)},
        })
            .then((blob) => {
                setPdfDownload(window.URL.createObjectURL(blob as unknown as Blob));
                setDownloadReady(true);
            })
            .catch((error) => {
                notifyError("Failed to get latex output PDF", getErrorMessage(error))
            })
    }

    const CompiledPDFTableBody = () : ReactElement => {
        return (
            <Table.Tbody>
                {submittedProposals.data?.map((sp) => (
                    <Table.Tr key={String(sp.dbid)}>
                        <Table.Td>{sp.name}</Table.Td>
                        <Table.Td>
                            <Button
                                disabled={!downloadReady}
                                component={"a"}
                                download={"justification.pdf"}
                                href={pdfDownLoad}
                                color={"blue"}>
                                Download
                            </Button>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        )
    }

    return (
        <Table>
            <CompiledPDFTableHeader />
            <CompiledPDFTableBody />
        </Table>
    )
}