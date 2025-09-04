import {ReactElement} from "react";
import {Accordion, Alert, Badge, Container, Group, Loader, Space, Text} from "@mantine/core";
import {
    useSubmittedProposalResourceGetSubmittedNotYetAllocated,
    useSubmittedProposalResourceGetSubmittedProposal
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import AssignReviewersForm from "./assignReviewers.form.tsx";


type SubmittedProposalItemProp = {
    cycleCode: number
    proposalId: number
}

function SubmittedProposalItem(props: SubmittedProposalItemProp) : ReactElement {

    const proposal =
        useSubmittedProposalResourceGetSubmittedProposal({
        pathParams: {
            cycleCode: props.cycleCode,
            submittedProposalId: props.proposalId
        }
    })

    if (proposal.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(proposal.error))
    }

    let noReviewsAssigned = proposal.data?.reviews?.length === undefined ||
        proposal.data?.reviews?.length === 0

    let reviewsLocked = new Date(proposal.data?.reviewsCompleteDate!).getTime() > 0

    return (
        <Accordion.Item value={String(props.proposalId)}>
            <Accordion.Control>
                <Group>
                    <Text size={"lg"}>{proposal.data?.title}</Text>
                    {
                        reviewsLocked &&
                        <Badge size={"sm"} radius={"sm"} color={"blue"}>
                            Reviews Locked
                        </Badge>
                    }
                </Group>

                <Space h={"sm"}/>
                <Group>
                    <Text size={"sm"} c={"gray.6"}> Assigned Reviewers: </Text>
                    {
                        noReviewsAssigned ?
                            <Badge size={"sm"} radius={"sm"} color={"red"}>
                                None assigned
                            </Badge>
                            :
                            proposal.data?.reviews?.map(
                                review =>(
                                    <Text
                                        key={review._id}
                                        size={"sm"}
                                        c={"gray.6"}
                                    >
                                        {review.reviewer?.person?.fullName}
                                    </Text>
                                )
                            )
                    }
                </Group>
            </Accordion.Control>
            <Accordion.Panel>
                {
                    proposal.isLoading ?
                        'loading...' :
                        reviewsLocked ?
                            <Group justify={"center"}>
                                <Text size={"sm"} c={"orange"}>
                                    Cannot assign or remove reviewers as the reviews are now locked for this proposal
                                </Text>
                            </Group>
                            :
                            <AssignReviewersForm {...proposal.data}/>
                }
            </Accordion.Panel>
        </Accordion.Item>
    )
}

export default function AssignReviewersAccordion() : ReactElement {

    const {selectedCycleCode} = useParams();

    const notYetAllocated =
        useSubmittedProposalResourceGetSubmittedNotYetAllocated({
            pathParams: {cycleCode: Number(selectedCycleCode)}
    })

    if (notYetAllocated.isLoading) {
        return(
            <Loader />
        )
    }

    if (notYetAllocated.error) {
        notifyError("Failed to load not yet allocated submitted proposals",
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
                    There are no available submitted proposals to assign reviewers
                </Alert>
            </Container>
        )
    }

    return (
        <Accordion defaultValue={"1"}>
            {
                notYetAllocated.data?.map(sp => {
                    return (
                        <SubmittedProposalItem
                            key={sp.dbid}
                            cycleCode={Number(selectedCycleCode)}
                            proposalId={sp.dbid!}
                        />
                    )
                })
            }
        </Accordion>
    )
}