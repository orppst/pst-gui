import {ReactElement} from "react";
import {
    useReviewerResourceGetReviewer,
    useReviewerResourceGetReviewers
} from "../../generated/proposalToolComponents.ts";
import {Loader, Table} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {randomId} from "@mantine/hooks";

function ReviewersRow(p: {reviewerID: number}) : ReactElement {

    const theReviewer
        = useReviewerResourceGetReviewer({
        pathParams: {reviewerId: p.reviewerID}
    });

    if (theReviewer.isLoading) {
        return (
            <Loader />
        )
    }

    if (theReviewer.isError) {
        return (
            <>Error loading this reviewer</>
        )
    }

    return (
        <Table.Tr>
            <Table.Td>{theReviewer.data?.person?.fullName}</Table.Td>
            <Table.Td>{theReviewer.data?.person?.eMail}</Table.Td>
        </Table.Tr>
    )
}


export default
function ListCurrentReviewers(): ReactElement {

    const currentReviewers
        = useReviewerResourceGetReviewers({});

    if (currentReviewers.isLoading) {
        return (
            <Loader />
        )
    }

    if (currentReviewers.isError) {
        return (
            <AlertErrorMessage
                title={"Error loading current reviewers"}
                error={getErrorMessage(currentReviewers.error)}
            />
        )
    }

    const reviewerRows =
        currentReviewers.data?.map((reviewer) => (
            <ReviewersRow
                key={reviewer.dbid ?? randomId()}
                reviewerID={reviewer.dbid!}
            />
        ))

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>email</Table.Th>
                    <Table.Th>Organisation</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {reviewerRows}
            </Table.Tbody>
        </Table>
    )
}