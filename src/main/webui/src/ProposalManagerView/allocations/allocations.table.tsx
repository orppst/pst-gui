import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {
    useSubmittedProposalResourceGetSubmittedProposal,
    useSubmittedProposalResourceGetSubmittedProposals
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";

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

    if (submittedProposal.isLoading) {
        return (
            <></>
        )
    }

    if (submittedProposal.error) {
        notifyError("Failed to load Submitted Proposal",
            getErrorMessage(submittedProposal.error))
    }

    if (new Date(submittedProposal.data?.reviewsCompleteDate!).getTime() > 0) {
        return(
            <Table.Tr>
                <Table.Td>{submittedProposal.data?.proposal?.title}</Table.Td>
                <Table.Td>{new Date(submittedProposal.data?.reviewsCompleteDate!).toDateString()}</Table.Td>
                <Table.Td>99</Table.Td>
                <Table.Td>allocate button / fail button</Table.Td>
            </Table.Tr>
        )
    } else {
        return (
            <></>
        )
    }
}

export default
function AllocationsTable() : ReactElement {

    const {selectedCycleCode} = useParams();

    const submittedProposals =
        useSubmittedProposalResourceGetSubmittedProposals({
        pathParams: {cycleCode: 1}
    })

    if (submittedProposals.isLoading) {
        return (
            <></>
        )
    }

    if (submittedProposals.error) {
        notifyError("Failed to load Submitted Proposals",
            getErrorMessage(submittedProposals.error))
    }

    const header = () => (
        <Table.Tr>
            <Table.Th>Proposal Title</Table.Th>
            <Table.Th>Reviews Complete Date</Table.Th>
            <Table.Th>Total Review Score</Table.Th>
            <Table.Th></Table.Th>
        </Table.Tr>
    )


    return(
        <Table>
            <Table.Thead>
                {header()}
            </Table.Thead>
            <Table.Tbody>
                {submittedProposals.data?.map(sp => (
                    <AllocationsTableRow
                        key={sp.dbid!}
                        cycleCode={Number(selectedCycleCode)}
                        submittedProposalId={sp.dbid!}
                    />
                ))}
            </Table.Tbody>
        </Table>
    )
}