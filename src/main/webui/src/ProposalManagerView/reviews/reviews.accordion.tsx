import {ReactElement} from "react";
import {ReviewsProps} from "./ReviewsPanel.tsx";
import {
    useProposalReviewResourceAddReview,
    useSubmittedProposalResourceGetSubmittedNotYetAllocated,
    useSubmittedProposalResourceGetSubmittedProposal
} from "../../generated/proposalToolComponents.ts";
import {Accordion, Alert, Badge, Container, Group, Loader, Space, Stack, Text} from "@mantine/core";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ReviewsForm from "./reviews.form.tsx";
import AddButton from "../../commonButtons/add.tsx";
import {useQueryClient} from "@tanstack/react-query";


export default
function ReviewsAccordion(props: ReviewsProps) : ReactElement {

    const queryClient = useQueryClient();

    const notYetAllocated =
        useSubmittedProposalResourceGetSubmittedNotYetAllocated({
            pathParams: {cycleCode: props.cycleCode}
    })

    const addReview = useProposalReviewResourceAddReview();

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

        let noReviewsAssigned = proposal.data?.reviews?.length === undefined ||
            proposal.data?.reviews?.length === 0

        let reviewsLocked = new Date(proposal.data?.reviewsCompleteDate!).getTime() > 0

        let yourReview =
            proposal.data?.reviews?.find(review =>
                review?.reviewer?._id == props.reviewerId)

        type AssignButtonData = {
            reviewerId: number,
            proposalId: number,
            proposalTitle?: string
        }

        const handleAssign = (buttonProps: AssignButtonData) =>  {
            addReview.mutate({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: itemProps.proposalId
                },
                // A "blank" review
                body: {
                    comment: "",
                    score: 0,
                    technicalFeasibility: false,
                    reviewer: {
                        _id: buttonProps.reviewerId
                    }
                }
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries()
                        .then(() =>
                            notifySuccess("Assigment Successful",
                                "You have self-assigned " + " to '" + buttonProps.proposalTitle + "'")
                        )
                },
                onError: (error) =>
                    notifyError("Failed to self-assign " + " to " +
                        "'" + buttonProps.proposalTitle  + "'", getErrorMessage(error))

            })
        }

        const hasUserCompletedReview = () => {

            let reviewCompleteDate =
                yourReview ? new Date(yourReview.reviewDate!) : new Date(0)

            let isReviewComplete = reviewCompleteDate.getTime() > 0
            return (
                <Group>
                    {
                        yourReview ?
                            isReviewComplete?
                                <Text size={"xs"} c={"green"}>
                                    You submitted on {reviewCompleteDate.toDateString()}
                                </Text>
                                :
                                <Text size={"xs"} c={"red"}>
                                    You have yet to submit a review for this proposal
                                </Text>
                            :
                            <Text size={"xs"} c={"blue"}>
                                You are not assigned to review this proposal
                            </Text>
                    }
                    {
                        reviewsLocked &&
                        <Text size={"xs"} c={"orange"}>
                            Reviews locked, no further edits allowed
                        </Text>
                    }
                </Group>
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
                            noReviewsAssigned ?
                                <Badge size={"sm"} bg={"red"} radius={"sm"}>
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
                    {
                        yourReview ?
                            <ReviewsForm
                                cycleCode={props.cycleCode}
                                proposalId={proposal.data?._id!}
                                theReview={yourReview}
                            />
                            :
                            props.reviewsLocked ?
                                <Text size={"sm"} c={"orange"}>
                                    You cannot provide a review for this proposal as the reviews have been locked.
                                </Text>
                                :
                                <Stack align={"center"}>
                                    <Text size={"sm"} c={"gray.5"}>
                                        You are currently not assigned to review '{proposal.data?.title}'.
                                        If you wish to review this proposal please click on the "Self-Assign" button.
                                    </Text>
                                    <AddButton
                                        toolTipLabel={"Assign yourself as a Reviewer"}
                                        label={"Self-Assign"}
                                        onClick={()=>handleAssign(
                                            {
                                                reviewerId: props.reviewerId,
                                                proposalId: proposal.data?._id!,
                                                proposalTitle: proposal.data?.title
                                            }
                                        )}
                                    />
                                </Stack>
                    }
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