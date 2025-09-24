import {ReactElement, useEffect, useState} from "react";
import {Table, Loader} from "@mantine/core";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {useSubmittedProposalResourceGetSubmittedProposal} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import EditButton from "../../commonButtons/edit.tsx";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */

type SubmittedTableRowProps = {
    cycleCode: number,
    submittedProposalId: number,
    index: number
}

function SubmittedProposalTableRow(rowProps: SubmittedTableRowProps) : ReactElement {

    const submittedProposal =
        useSubmittedProposalResourceGetSubmittedProposal({
            pathParams: {
                cycleCode: rowProps.cycleCode,
                submittedProposalId: rowProps.submittedProposalId
            }
        })

    const [reviewsCompleteAndLocked, setReviewsCompleteAndLocked] = useState(false)
    const [proposalAccepted, setProposalAccepted] = useState(false)

    useEffect(() => {
        if (submittedProposal.status === 'success') {
            let numReviewsComplete : number = 0
            submittedProposal.data?.reviews?.forEach(review => {
                if(new Date(review.reviewDate!).getTime() > 0) {
                    numReviewsComplete += 1
                }
            })

            setReviewsCompleteAndLocked(
                submittedProposal.data?.reviews?.length !== undefined &&
                submittedProposal.data?.reviews?.length > 0 &&
                numReviewsComplete === submittedProposal.data?.reviews?.length! &&
                new Date(submittedProposal.data?.reviewsCompleteDate!).getTime() > 0
            )

            setProposalAccepted(submittedProposal.data?.successful!)
        }
    }, [submittedProposal]);

    if (submittedProposal.isError) {
        return (
            <Table.Tr c={"red"}>
                <Table.Td>
                    Failed to load proposal
                </Table.Td>
            </Table.Tr>
        )
    }

    if (submittedProposal.isLoading) {
        return (
            rowProps.index === 0 ? <Loader/> : <></>
        )
    }

    return (
        <Table.Tr>
            <Table.Td>
                <EditButton
                    toolTipLabel={'Change proposal code'}
                    label={submittedProposal.data?.proposalCode}
                />
            </Table.Td>
            <Table.Td>{submittedProposal.data?.title}</Table.Td>
            <Table.Td c={proposalAccepted ? "green" : reviewsCompleteAndLocked ? "red" : "blue"}>
                {
                    proposalAccepted ? "accepted" :
                        reviewsCompleteAndLocked ? "rejected" :
                            "under review"
                }
            </Table.Td>
        </Table.Tr>
    )
}


export default
function SubmittedProposalsTable(submittedProposals: ObjectIdentifier[]) : ReactElement {

    const {selectedCycleCode} = useParams();

    const SubmittedProposalsTableHeader = () : ReactElement => {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Code</Table.Th>
                    <Table.Th>Proposal Title</Table.Th>
                    <Table.Th>Current Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
        )
    }

    const SubmittedProposalsTableBody = () : ReactElement => {
        return (
            <Table.Tbody>
                {submittedProposals.map((sp, index) => (
                    <SubmittedProposalTableRow
                        key={sp.dbid}
                        cycleCode={Number(selectedCycleCode)}
                        submittedProposalId={sp.dbid!}
                        index={index}
                    />
                ))}
            </Table.Tbody>
        )
    }

    return (
        <Table stickyHeader>
            <SubmittedProposalsTableHeader />
            <SubmittedProposalsTableBody />
        </Table>
    )
}