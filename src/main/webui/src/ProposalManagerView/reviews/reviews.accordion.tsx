import {ReactElement} from "react";
import {ReviewsProps} from "./ReviewsPanel.tsx";
import {
    useSubmittedProposalResourceGetSubmittedProposal,
    useSubmittedProposalResourceGetSubmittedProposals
} from "../../generated/proposalToolComponents.ts";
import {Accordion, Badge, Group, Space, Text} from "@mantine/core";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ReviewsForm from "./reviews.form.tsx";

export default
function ReviewsAccordion(props: ReviewsProps) : ReactElement {

    const submittedProposals = useSubmittedProposalResourceGetSubmittedProposals({
        pathParams: {cycleCode: props.cycleCode}
    })

    if (submittedProposals.isLoading) {
        return (
            <></>
        )
    }

    if (submittedProposals.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(submittedProposals.error))
    }

    type ItemProps = {
        proposalId: number
    }

    function SubmittedProposalReviewItem(itemProps: ItemProps) : ReactElement {

        const proposal = useSubmittedProposalResourceGetSubmittedProposal({
            pathParams: {
                cycleCode: props.cycleCode,
                submittedProposalId: itemProps.proposalId
            }
        })

        if (proposal.error) {
            notifyError("Failed to load Submitted Proposal",
                getErrorMessage(proposal.error))
        }

        if (proposal.isLoading) {
            return (
                <></>
            )
        }

        const hasUserCompletedReview = () => {

            let yourReview =
                proposal.data?.reviews?.find(review => review?.reviewer?._id == props.reviewerId)

            let reviewCompleteDate = yourReview ? new Date(yourReview.reviewDate!) : new Date(0)

            let isReviewComplete = reviewCompleteDate.getTime() > 0
            return (
                <>
                    {
                        yourReview ?
                            isReviewComplete ?
                                <Text size={"xs"} c={"green"}>
                                    You have completed this review on {reviewCompleteDate.toDateString()}
                                </Text>
                                :
                                <Text size={"xs"} c={"red"}>
                                    You have yet to complete the review for this proposal
                                </Text>
                            :
                            <Text size={"xs"} c={"blue"}>
                                You are not assigned to this proposal
                            </Text>
                    }
                </>
            )
        }

        return (
            <Accordion.Item value={String(itemProps.proposalId)}>
                <Accordion.Control>
                    <Group>
                        <Text size={"lg"}>{proposal.data?.proposal?.title}</Text>
                        {hasUserCompletedReview()}
                    </Group>

                    <Space h={"sm"}/>
                    <Group>
                        <Text size={"sm"} c={"gray.6"}> Assigned Reviewers: </Text>
                        {
                            proposal.data?.reviews?.length == 0 ?
                                <Badge
                                    size={"sm"}
                                    bg={"red.5"}
                                    radius={"sm"}
                                >
                                    None assigned
                                </Badge>
                                :
                                proposal.data?.reviews?.map(
                                    review => {
                                        let you : boolean = review.reviewer?._id == props.reviewerId;

                                        return (
                                            <Text
                                                key={review._id}
                                                size={"sm"}
                                                c={you? "green" : "gray.6"}
                                            >
                                                {you ? "You" : review.reviewer?.person?.fullName}
                                            </Text>
                                        )}
                                )
                        }
                    </Group>

                </Accordion.Control>
                <Accordion.Panel>
                    <ReviewsForm
                        reviewerId={props.reviewerId}
                        cycleCode={props.cycleCode}
                        proposal={proposal.data}
                    />
                </Accordion.Panel>
            </Accordion.Item>
        )
    }

    return (
        <Accordion>
            {
                submittedProposals.data?.map(sp => (
                    <SubmittedProposalReviewItem
                        key={sp.dbid!}
                        proposalId={sp.dbid!}
                    />
                ))
            }
        </Accordion>
    )
}