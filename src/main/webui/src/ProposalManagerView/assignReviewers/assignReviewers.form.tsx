import {ReactElement} from "react";
import {Group, Table, Text} from "@mantine/core";
import {
    fetchProposalReviewResourceAddReview, fetchProposalReviewResourceRemoveReview,
    useReviewerResourceGetReviewers
} from "../../generated/proposalToolComponents.ts";
import {SubmittedProposal} from "../../generated/proposalToolSchemas.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import DeleteButton from "../../commonButtons/delete.tsx";
import {modals} from "@mantine/modals";
import AddButton from "../../commonButtons/add.tsx";

export default function AssignReviewersForm(proposal: SubmittedProposal) : ReactElement {

    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

    const reviewers = useReviewerResourceGetReviewers({})

    if (reviewers.error) {
        notifyError("Failed to load reviewers", getErrorMessage(reviewers.error))
    }

    if (reviewers.isLoading) {
        return (
            <></>
        )
    }

    type ButtonData = {
        reviewerId: number,
        reviewerName?: string,
        proposalId: number,
        proposalTitle?: string
    }

    const handleRemoval = (props: ButtonData) => {
        // there is a one-to-one relationship between a ProposalReview and the Reviewer, and
        // a Reviewer is associated to one ProposalReview per SubmittedProposal only i.e.,
        // we can find the ProposalReview to remove by checking the Reviewer id.
        let reviewToRemove  =
            proposal.reviews?.find(review => review.reviewer?._id == props.reviewerId)!

        fetchProposalReviewResourceRemoveReview({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                submittedProposalId: props.proposalId,
                reviewId: reviewToRemove._id!
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess("Removal Successful",
                "Removed " + props.reviewerName + " as a reviewer from '" + props.proposalTitle +"'"))
            .catch(error => notifyError(
                "Failed to remove " + props.reviewerName + "from '" + props.proposalTitle + "'",
                getErrorMessage(error)))
    }

    const confirmRemoval = (props: ButtonData) => {
        modals.openConfirmModal({
            title: "Remove " +  props.reviewerName + " as a reviewer from the proposal?",
            centered: true,
            children: (
                <Text size={"sm"}>
                    This will remove {props.reviewerName} as a reviewer from
                    the proposal '{props.proposalTitle}', including any work
                    to date they have done on the review, are you sure?
                </Text>
            ),
            labels: {confirm: "Remove", cancel: "No, don't remove " + props.reviewerName},
            confirmProps: {color: "red"},
            onConfirm: () => handleRemoval({...props})
        })
    }

    const handleAssign = (props: ButtonData) =>  {
        fetchProposalReviewResourceAddReview({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                submittedProposalId: proposal._id!
            },
            // A "blank" review
            body: {
                comment: "",
                score: 0,
                technicalFeasibility: false,
                reviewer: {
                    _id: props.reviewerId
                }
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess("Assigment Successful",
                "Assigned " + props.reviewerName + " to '" + props.proposalTitle + "'"))
            .catch(error => notifyError("Failed to assign " + props.reviewerName +
                " to " + "'" + props.proposalTitle  + "'",
                getErrorMessage(error)))
    }

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Reviewer</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {reviewers.data?.map(reviewer => (
                    <Table.Tr key={reviewer.dbid}>
                        <Table.Td>
                            {reviewer.name}
                        </Table.Td>
                        <Table.Td>
                            <Group justify={"flex-end"}>
                            {
                                !proposal.reviews?.find(r =>
                                    r.reviewer?._id == reviewer.dbid) ?

                                    <AddButton
                                        toolTipLabel={"Assign reviewer"}
                                        label={"Assign"}
                                        disabled={!!proposal.reviews?.find(
                                            r => r.reviewer?._id == reviewer.dbid
                                        )}
                                        onClick={()=>handleAssign(
                                            {reviewerId: reviewer.dbid!, reviewerName: reviewer.name!,
                                                proposalId: proposal._id!, proposalTitle: proposal.proposal?.title!}
                                        )}
                                    />
                                    :
                                    <DeleteButton
                                        toolTipLabel={"remove reviewer"}
                                        label={"Remove"}
                                        disabled={!proposal.reviews?.find(
                                            r => r.reviewer?._id == reviewer.dbid
                                        )}
                                        onClick={() => confirmRemoval(
                                            {reviewerId: reviewer.dbid!, reviewerName: reviewer.name!,
                                                proposalId: proposal._id!, proposalTitle: proposal.proposal?.title!}
                                        )}
                                    />
                            }
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    )
}