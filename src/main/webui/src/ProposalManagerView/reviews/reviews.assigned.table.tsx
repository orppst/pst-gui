import {ReactElement} from "react";
import {Group, Loader, Table} from "@mantine/core";
import {
    fetchJustificationsResourceDownloadReviewerZip,
    useSubmittedProposalResourceGetSubmittedProposal
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ExportButton} from "../../commonButtons/export.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {useToken} from "../../App2.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import EditButton from "../../commonButtons/edit.tsx";
import {useNavigate} from "react-router-dom";


export default
function ReviewsAssignedTable(props: {
    cycleCode: number,
    reviewerId: number,
    assigned: ObjectIdentifier[]
}) : ReactElement {

    const authToken = useToken();
    const navigate = useNavigate();

    // begin row function ------------------------------------------
    function ReviewsTableRow(rowProps: {
        submittedProposalId: number
        proposalTitle: string
    }): ReactElement  {

        const submittedProposal =
            useSubmittedProposalResourceGetSubmittedProposal({
                pathParams: {cycleCode: props.cycleCode, submittedProposalId: rowProps.submittedProposalId}
            })

        if (submittedProposal.isLoading) {
            return (<Loader/>)
        }

        if (submittedProposal.isError) {
            return (<>Unable to load submitted proposal</>)
        }

        const review = submittedProposal.data?.reviews?.find(
            review => review.reviewer?._id === props.reviewerId)

        const reviewsLocked : boolean = new Date(submittedProposal.data?.reviewsCompleteDate!).getTime() > 0

        const submittedReview : boolean = new Date(review?.reviewDate!).getTime() > 0

        function downloadReviewPDF() {
            fetchJustificationsResourceDownloadReviewerZip({
                pathParams: {proposalCode: rowProps.submittedProposalId},
                headers: {authorization: `Bearer ${authToken}`}
            })
                .then((reviewPDF) => {
                    if (reviewPDF) {
                        const link = document.createElement("a");
                        link.href = window.URL.createObjectURL(reviewPDF);
                        link.download = rowProps.submittedProposalId + " "
                            + rowProps.proposalTitle.replace(/([^a-z0-9\s.]+)/gi, '_')
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
                <Table.Td> {rowProps.proposalTitle} </Table.Td>
                <Table.Td c={submittedReview? "green" : "red"}>
                    <Group justify={"flex-end"}>
                        {
                            submittedReview ?
                                "submitted" :
                                "unsubmitted changes"
                        }
                    </Group>
                </Table.Td>
                <Table.Td>
                    <Group justify={"flex-end"}>
                        <ExportButton
                            onClick={() => downloadReviewPDF()}
                            toolTipLabel={"Download a PDF of this proposal"}
                            label={"Proposal PDF"}
                        />
                        <EditButton
                            toolTipLabel={reviewsLocked ?
                                "Reviews locked for this proposal, no further edits allowed" :
                                "Edit your review for this proposal"}
                            onClick={() =>
                                navigate(
                                    rowProps.proposalTitle + "/"
                                    + rowProps.submittedProposalId + "/"
                                    + props.reviewerId + "/"
                                    + review?._id!,
                                    {relative: "path"})}
                            disabled={reviewsLocked}
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
                <Table.Th><Group justify={'flex-end'}>Status</Group></Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const reviewsTableRows =
        props.assigned.map(sp => (
            <ReviewsTableRow
                key={sp.dbid}
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