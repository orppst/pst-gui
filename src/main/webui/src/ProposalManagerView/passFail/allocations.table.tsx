import {ReactElement, useEffect, useState} from "react";
import {Alert, Badge, Button, Container, Group, Loader, Table, Tooltip} from "@mantine/core";
import {
    useAllocatedProposalResourceAllocateProposalToCycle,
    useSubmittedProposalResourceGetSubmittedProposal,
    useSubmittedProposalResourceResetReviewsCompleteDate, useSubmittedProposalResourceUpdateReviewsCompleteDate
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {IconInfoCircle, IconLock, IconLockOpen, IconThumbUp} from "@tabler/icons-react";
import {CLOSE_DELAY, ICON_SIZE, OPEN_DELAY} from "../../constants.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

type AllocationTableRowProps = {
    cycleCode: number,
    submittedProposalId: number,
    index: number
}

function AllocationsTableRow(rowProps: AllocationTableRowProps) : ReactElement {

    const queryClient = useQueryClient();

    const {fetcherOptions} = useProposalToolContext();

    const lockReviews =
        useSubmittedProposalResourceUpdateReviewsCompleteDate();

    const unlockReviews =
        useSubmittedProposalResourceResetReviewsCompleteDate();

    const allocateProposalToCycle =
        useAllocatedProposalResourceAllocateProposalToCycle()

    const submittedProposal =
        useSubmittedProposalResourceGetSubmittedProposal({
            pathParams: {
                cycleCode: rowProps.cycleCode,
                submittedProposalId: rowProps.submittedProposalId
            }
    })

    const [completedReviews, setCompletedReviews] = useState(0)
    const [accumulatedScore, setAccumulatedScore] = useState(0)
    const [reviewersAssigned, setReviewersAssigned] = useState(false)
    const [reviewsComplete, setReviewsComplete] = useState(false)
    const [reviewsLocked, setReviewsLocked] = useState(false)
    const [proposalAccepted, setProposalAccepted] = useState(false)


    useEffect(() => {
        if (submittedProposal.status === 'success') {
            let numReviewsComplete : number = 0
            let totalScore : number = 0
            submittedProposal.data?.reviews?.forEach(review => {
                if(new Date(review.reviewDate!).getTime() > 0) {
                    numReviewsComplete += 1
                    totalScore += review.score!
                }
            })

            setCompletedReviews(numReviewsComplete)
            setAccumulatedScore(totalScore)

            setReviewersAssigned(submittedProposal.data?.reviews?.length !== undefined &&
                submittedProposal.data?.reviews?.length > 0)

            setReviewsComplete( reviewersAssigned &&
                completedReviews === submittedProposal.data?.reviews?.length!)

            //reviews are "locked" if the complete date is any date later than the posix epoch
            setReviewsLocked(new Date(submittedProposal.data?.reviewsCompleteDate!).getTime() > 0)

            setProposalAccepted(submittedProposal.data?.successful!)
        }
    }, [submittedProposal]);

    if (submittedProposal.isLoading) {
        //return a single loader for the entire table
        return (
            rowProps.index === 0 ? <Loader/> : <></>
        )
    }

    if (submittedProposal.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(submittedProposal.error))
    }

    let title = submittedProposal.data?.title

    const handleLockReviews = () => {
        lockReviews.mutate({
            pathParams: {
                cycleCode: rowProps.cycleCode,
                submittedProposalId: rowProps.submittedProposalId
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then(() => {
                    notifySuccess("Reviews Locked",
                        "if desired you can now 'accept' the proposal else leave it 'rejected'")
                })
            },
            onError: (error) =>
                notifyError("Failed to lock reviews", getErrorMessage(error))
        })
    }

    const handleUnlockReviews = () => {
        unlockReviews.mutate({
            pathParams: {
                cycleCode: rowProps.cycleCode,
                submittedProposalId: rowProps.submittedProposalId
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then(() => {
                    notifySuccess("Reviews Unlocked",
                        "reviews can now be edited, relock reviews to accept proposals")
                })
            },
            onError: (error) => {
                notifyError("Failed to unlock reviews", getErrorMessage(error))
            }
        })
    }

    const handlePass = () => {
        allocateProposalToCycle.mutate({
            pathParams: {
                cycleCode: rowProps.cycleCode
            },
            body: rowProps.submittedProposalId,
            // @ts-ignore
            headers: {...fetcherOptions.headers, "Content-Type": "text/plain"}
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() =>
                        notifySuccess("Success",
                            title + " can now be allocated resources")
                    )
            },
            onError: error =>
                notifyError("Failed to upgrade proposal for allocation",
                getErrorMessage(error))
        })
    }



    return(
        <Table.Tr>
            <Table.Td>{submittedProposal.data?.title}</Table.Td>
            <Table.Td>
                {
                    proposalAccepted ?
                        <Badge size={"xs"} bg={"blue"} radius={"sm"}>
                            Completed
                        </Badge>
                        :
                    reviewersAssigned ?
                        <>
                            {completedReviews} / {submittedProposal.data?.reviews?.length}
                        </>
                       :
                        <Badge size={"xs"} bg={"red"} radius={"sm"}>
                            Assign a reviewer
                        </Badge>
                }
            </Table.Td>
            <Table.Td>{accumulatedScore}</Table.Td>
            <Table.Td>
                {
                    proposalAccepted ? "accepted" :
                    reviewsComplete ? "rejected" : "under review"
                }
            </Table.Td>
            {
                !proposalAccepted ?
                <Table.Td>
                    <Group>
                    {
                        reviewsLocked ?
                            <Tooltip
                                label={reviewsComplete ? "unlock reviews for this proposal" : "reviews incomplete"}
                            >
                                <Button
                                    leftSection={<IconLock/>}
                                    color={"blue"}
                                    disabled={!reviewsComplete}
                                    onClick={handleUnlockReviews}
                                >
                                    Unlock Reviews
                                </Button>
                            </Tooltip>
                            :
                            <Tooltip
                                label={reviewsComplete ? "lock reviews for this proposal" : "reviews incomplete"}
                            >
                                <Button
                                    leftSection={<IconLockOpen/>}
                                    color={"blue"}
                                    disabled={!reviewsComplete}
                                    onClick={handleLockReviews}
                                >
                                    Lock Reviews
                                </Button>
                            </Tooltip>
                    }
                        <Tooltip
                            label={proposalAccepted ? "already accepted" :
                                reviewsLocked? "accept this proposal" : "reviews unlocked"}
                            openDelay={OPEN_DELAY}
                            closeDelay={CLOSE_DELAY}
                        >
                            <Button
                                rightSection={<IconThumbUp size={ICON_SIZE}/>}
                                color={"green"}
                                disabled={proposalAccepted || !reviewsLocked}
                                onClick={handlePass}
                            >
                                Accept
                            </Button>
                        </Tooltip>
                    </Group>
                </Table.Td> : <Table.Td></Table.Td>
            }
        </Table.Tr>
    )
}

export default
function AllocationsTable(props:{submittedIds: ObjectIdentifier[]}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const header = () => (
        //last blank header is for the 'lock reviews' and the 'accept' buttons.
        <Table.Tr>
            <Table.Th>Proposal Title</Table.Th>
            <Table.Th>Reviews Done</Table.Th>
            <Table.Th>Accumulated Score</Table.Th>
            <Table.Th>Accepted/Rejected</Table.Th>
            <Table.Th></Table.Th>
        </Table.Tr>
    )

    const alertNoSubmittedProposals = () => (
        <Container size={"50%"} mt={"100"}>
            <Alert
                variant={"light"}
                color={"blue"}
                title={"All Submitted Proposals Passed"}
                icon={<IconInfoCircle/>}
            >
                No proposals have been submitted to this observation cycle
            </Alert>
        </Container>
    )

    return(
        <>
        { props.submittedIds.length == 0 ?
            alertNoSubmittedProposals()
            :
            <Table>
                <Table.Thead>
                    {header()}
                </Table.Thead>
                <Table.Tbody>
                    {props.submittedIds.map((sp, index) => (
                        <AllocationsTableRow
                            key={sp.dbid}
                            cycleCode={Number(selectedCycleCode)}
                            submittedProposalId={sp.dbid!}
                            index={index}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        }
        </>
    )
}