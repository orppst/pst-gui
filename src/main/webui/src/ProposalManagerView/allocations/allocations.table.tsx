import {ReactElement, useEffect, useState} from "react";
import {Badge, Table, Text} from "@mantine/core";
import {
    useSubmittedProposalResourceGetSubmittedProposal
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

type AllocationTableRowProps = {
    cycleCode: number,
    submittedProposalId: number
}

function AllocationsTableRow(rowProps: AllocationTableRowProps) : ReactElement {

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
    }, []);

    if (submittedProposal.isLoading) {
        return (
            <></>
        )
    }

    if (submittedProposal.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(submittedProposal.error))
    }

    return(
        <Table.Tr>
            <Table.Td>{submittedProposal.data?.proposal?.title}</Table.Td>
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
                allocate button / fail button
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

    return(
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
    )
}