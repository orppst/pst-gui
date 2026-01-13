import {ReactElement} from "react";
import {Group, Table} from "@mantine/core";
import {
    fetchJustificationsResourceDownloadReviewerZip
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ExportButton} from "../../commonButtons/export.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {useToken} from "../../App2.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import EditButton from "../../commonButtons/edit.tsx";


export default
function ReviewsAssignedTable(props: {
    cycleCode: number,
    assigned: ObjectIdentifier[]
}) : ReactElement {

    const authToken = useToken();

    // begin row function ------------------------------------------
    function ReviewsTableRow(props: {
        cycleCode: number
        submittedProposalId: number
        proposalTitle: string
    }): ReactElement  {

        function downloadReviewPDF() {
            fetchJustificationsResourceDownloadReviewerZip({
                pathParams: {proposalCode: props.submittedProposalId},
                headers: {authorization: `Bearer ${authToken}`}
            })
                .then((reviewPDF) => {
                    if (reviewPDF) {
                        const link = document.createElement("a");
                        link.href = window.URL.createObjectURL(reviewPDF);
                        link.download = props.submittedProposalId + " "
                            + props.proposalTitle.replace(/([^a-z0-9\s.]+)/gi, '_')
                                .substring(0,30)
                            + ".zip";
                        link.click();
                    } else
                        notifyError("Failed to download review", "The file is empty")
                })
                .then(() => notifySuccess("Download review", "The ZIP has downloaded"))
                .catch(error => notifyError("Failed to download review", getErrorMessage(error)))
        }

        return (
            <Table.Tr>
                <Table.Td> {props.proposalTitle} </Table.Td>
                <Table.Td>
                    <Group justify={"flex-end"}>
                        <ExportButton
                            onClick={() => downloadReviewPDF()}
                            toolTipLabel={"Download a PDF of this proposal"}
                            label={"Proposal PDF"}
                        />
                        <EditButton
                            toolTipLabel={"Edit your review for this proposal"}
                        />
                    </Group>

                </Table.Td>
            </Table.Tr>
        )
    }
    // end row function --------------------------------------------

    const reviewsTableHeader = (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Proposal Title</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const reviewsTableRows =
        props.assigned.map(sp => (
            <ReviewsTableRow
                cycleCode={props.cycleCode}
                submittedProposalId={sp.dbid!}
                proposalTitle={sp.name!}
            />
        ))

    return (
        <Table>
            {reviewsTableHeader}
            <Table.Tbody>
                {reviewsTableRows}
            </Table.Tbody>
        </Table>
    )
}