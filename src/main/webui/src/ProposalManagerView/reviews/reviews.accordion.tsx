import {ReactElement} from "react";
import {ReviewsProps} from "./ReviewsPanel.tsx";
import {
    useSubmittedProposalResourceGetSubmittedNotYetAllocated,
    useSubmittedProposalResourceGetSubmittedProposal
} from "../../generated/proposalToolComponents.ts";
import {Accordion, Alert, Badge, Container, Group, Loader, Space, Text} from "@mantine/core";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ReviewsForm from "./reviews.form.tsx";

export default
function ReviewsAccordion(props: ReviewsProps) : ReactElement {

    const notYetAllocated =
        useSubmittedProposalResourceGetSubmittedNotYetAllocated({
            pathParams: {cycleCode: props.cycleCode}
    })

    if (notYetAllocated.isLoading) {
        return (<Loader />)
    }

    if (notYetAllocated.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(notYetAllocated.error))
    }

    if (notYetAllocated.data?.length === 0) {
        return (
            <Container size={"50%"} mt={100}>
                <Alert
                    variant={"light"}
                    title={"No outstanding Submitted Proposals"}
                    color={"green"}
                >
                    There are no available submitted proposals to review
                </Alert>
            </Container>
        )
    }


    function SubmittedProposalReviewItem(itemProps: {proposalId: number}) : ReactElement {

        const proposal =
            useSubmittedProposalResourceGetSubmittedProposal({
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
            return (<Loader/>)
        }

        const hasUserCompletedReview = () => {

            let yourReview =
                proposal.data?.reviews?.find(review =>
                    review?.reviewer?._id == props.reviewerId)

            let reviewCompleteDate = yourReview ? new Date(yourReview.reviewDate!) :
                new Date(0)

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
                        <Text size={"lg"}>{proposal.data?.title}</Text>
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
                                        let you : boolean =
                                            review.reviewer?._id == props.reviewerId;

                                        return (
                                            <Text
                                                key={review._id}
                                                size={"sm"}
                                                c={you? "green" : "gray.6"}
                                            >
                                                {review.reviewer?.person?.fullName}
                                                {you && " (you)"}
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
                notYetAllocated.data?.map(sp => (
                    <SubmittedProposalReviewItem
                        key={sp.dbid!}
                        proposalId={sp.dbid!}
                    />
                ))
            }
        </Accordion>
    )
}