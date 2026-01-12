import {ReactElement} from "react";
import {
    useReviewerResourceGetReviewer,
    useReviewerResourceGetReviewers, useReviewerResourceRemoveReviewer
} from "../../generated/proposalToolComponents.ts";
import {Loader, Table, Text} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {randomId} from "@mantine/hooks";
import DeleteButton from "../../commonButtons/delete.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

function ReviewersRow(p: {reviewerID: number}) : ReactElement {

    const theReviewer
        = useReviewerResourceGetReviewer({
        pathParams: {reviewerId: p.reviewerID}
    });

    const queryClient = useQueryClient();

    const removeReviewerMutation = useReviewerResourceRemoveReviewer();

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

    const handleRemoveReviewer = () => {
        removeReviewerMutation
            .mutate({
                pathParams: {reviewerId: p.reviewerID}
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries().then(
                        () => notifySuccess("Reviewer Removed",
                            "the selected user has been removed as a reviewer"),
                    )
                }
                ,
                onError: (error) =>
                    notifyError("Failed to remove reviewer", getErrorMessage(error))
            })
    }

    const confirmReviewerRemoval = () =>
        modals.openConfirmModal({
            title: "Remove Reviewer",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove {theReviewer.data?.person?.fullName} as a Reviewer?
                </Text>
            ),
            labels: { confirm: "Remove", cancel: "No, don't remove" },
            confirmProps: { color: "red" },
            onConfirm: () => handleRemoveReviewer(),
        });

    return (
        <Table.Tr>
            <Table.Td>{theReviewer.data?.person?.fullName}</Table.Td>
            <Table.Td>{theReviewer.data?.person?.eMail}</Table.Td>
            <Table.Td>{theReviewer.data?.person?.homeInstitute?.name}</Table.Td>
            <Table.Td>
                <DeleteButton
                    toolTipLabel={"remove user as a reviewer"}
                    label={"Remove Reviewer"}
                    variant={"outline"}
                    onClick={confirmReviewerRemoval}
                />
            </Table.Td>
        </Table.Tr>
    )
}


export default
function ListCurrentReviewers(props: {
    tacMembers: ObjectIdentifier[]
}): ReactElement {

    const allReviewers
        = useReviewerResourceGetReviewers({});

    if (allReviewers.isLoading) {
        return (
            <Loader />
        )
    }

    if (allReviewers.isError) {
        return (
            <AlertErrorMessage
                title={"Error loading current reviewers"}
                error={getErrorMessage(allReviewers.error)}
            />
        )
    }

    const reviewersNotOnTAC = allReviewers.data?.filter(reviewer =>
        !props.tacMembers.find((tacMember) => tacMember.code === reviewer.code)
    )

    const reviewerRows =
        [... new Set(reviewersNotOnTAC)].map((reviewer) => (
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
                    <Table.Th>Institute</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {reviewerRows}
            </Table.Tbody>
        </Table>
    )
}