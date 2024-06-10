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

        return (
            <Accordion.Item value={String(itemProps.proposalId)}>
                <Accordion.Control>
                    <Text size={"lg"}>{proposal.data?.proposal?.title}</Text>
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
                                    review =>(
                                        <Text
                                            key={review._id}
                                            size={"sm"}
                                            c={ review.reviewer?._id == props.reviewerId ? "green" : "gray.6"}
                                        >
                                            {review.reviewer?.person?.fullName}
                                        </Text>
                                    )
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