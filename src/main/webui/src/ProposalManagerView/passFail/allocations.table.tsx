import {ReactElement, useEffect, useState} from "react";
import {Alert, Badge, Button, Container, Loader, Table, Text, Tooltip} from "@mantine/core";
import {
    useAllocatedProposalResourceAllocateProposalToCycle,
    useSubmittedProposalResourceGetSubmittedProposal
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {IconAlien, IconInfoCircle} from "@tabler/icons-react";
import {CLOSE_DELAY, ICON_SIZE, OPEN_DELAY} from "../../constants.tsx";
import {modals} from "@mantine/modals";
import {useQueryClient} from "@tanstack/react-query";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

type AllocationTableRowProps = {
    cycleCode: number,
    submittedProposalId: number
}

function AllocationsTableRow(rowProps: AllocationTableRowProps) : ReactElement {

    const queryClient = useQueryClient();

    const {fetcherOptions} = useProposalToolContext();

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


    useEffect(() => {
        let reviewsComplete : number = 0
        let totalScore : number = 0
        submittedProposal.data?.reviews?.forEach(review => {
            if(new Date(review.reviewDate!).getTime() > 0) {
                reviewsComplete += 1
                totalScore += review.score!
            }
        })
        setCompletedReviews(reviewsComplete)
        setAccumulatedScore(totalScore)
    }, [submittedProposal]);

    if (submittedProposal.isLoading) {
        return (<Loader/>)
    }

    if (submittedProposal.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(submittedProposal.error))
    }

    let title = submittedProposal.data?.title

    function handlePass(){
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

    const confirmPass = () => {
        modals.openConfirmModal({
            title: "Confirm proposal has passed review",
            centered: true,
            children: (
                <Text size={"sm"} c={"orange"}>
                    This confirms that {title} has passed review and can
                    be allocated resources from the available resources pool.
                    Please confirm this action.
                </Text>
            ),
            labels: {confirm: "Confirm", cancel: "You shall not pass!!"},
            confirmProps: {color: "grape"},
            onConfirm: () => handlePass()
        })
    }

    let disablePassButton : boolean = submittedProposal.data?.reviews?.length == 0 ||
        completedReviews < submittedProposal.data?.reviews?.length!

    return(
        <Table.Tr>
            <Table.Td>{submittedProposal.data?.title}</Table.Td>
            <Table.Td>
                {
                    submittedProposal.data?.reviews?.length! == 0 ?
                       <Badge size={"xs"} bg={"red"} radius={"sm"}>
                           Reviewers yet to be assigned
                       </Badge>
                       :
                        <Text>
                            {completedReviews} / {submittedProposal.data?.reviews?.length!}
                        </Text>

                }
            </Table.Td>
            <Table.Td>{accumulatedScore}</Table.Td>
            <Table.Td>
                <Tooltip
                    label={disablePassButton? "reviews incomplete" :
                    "Click to pass this review to allocation"}
                    openDelay={OPEN_DELAY}
                    closeDelay={CLOSE_DELAY}
                >
                    <Button
                        rightSection={<IconAlien size={ICON_SIZE}/>}
                        color={"grape"}
                        variant={"light"}
                        disabled={disablePassButton}
                        onClick={() => confirmPass()}
                    >
                        Pass Review
                    </Button>
                </Tooltip>
            </Table.Td>
        </Table.Tr>
    )
}

export default
function AllocationsTable(props:{submittedIds: ObjectIdentifier[]}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const header = () => (
        <Table.Tr>
            <Table.Th>Proposal Title</Table.Th>
            <Table.Th>Reviews Complete</Table.Th>
            <Table.Th>Accumulated Score</Table.Th>
            <Table.Th></Table.Th>
        </Table.Tr>
    )

    const alertAllSubmittedProposalsPassed = () => (
        <Container size={"50%"} mt={"100"}>
            <Alert
                variant={"light"}
                color={"blue"}
                title={"All Submitted Proposals Passed"}
                icon={<IconInfoCircle/>}
            >
                All submitted proposals have passed review and are ready to be allocated resources
            </Alert>
        </Container>
    )

    return(
        <>
        { props.submittedIds.length == 0 ?
            //unlikely as some proposal may fail i.e., not pass review for allocation
            alertAllSubmittedProposalsPassed()
            :
            <Table>
                <Table.Thead>
                    {header()}
                </Table.Thead>
                <Table.Tbody>
                    {props.submittedIds.map(sp => (
                        <AllocationsTableRow
                            key={sp.dbid}
                            cycleCode={Number(selectedCycleCode)}
                            submittedProposalId={sp.dbid!}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        }
        </>




    )
}