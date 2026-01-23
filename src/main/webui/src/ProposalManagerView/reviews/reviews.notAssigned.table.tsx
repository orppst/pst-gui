import {ReactElement} from "react";
import {
    useProposalReviewResourceAddReview,
} from "../../generated/proposalToolComponents.ts";
import {Flex, Table, Text} from "@mantine/core";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import AddButton from "../../commonButtons/add.tsx";

export default
function ReviewsNotAssignedTable(props: {
    cycleCode: number
    reviewerId: number
    notAssigned: ObjectIdentifier[]
}) : ReactElement {

    const queryClient = useQueryClient();

    const addReview = useProposalReviewResourceAddReview();

    type AssignButtonData = {
        reviewerId: number,
        proposalId: number,
        proposalTitle?: string
    }

    const handleAssign = (buttonProps: AssignButtonData) =>  {
        addReview.mutate({
            pathParams: {
                cycleCode: props.cycleCode,
                submittedProposalId: buttonProps.proposalId
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

    const confirmSelfAssign = (buttonProps: AssignButtonData) => {
        modals.openConfirmModal({
            title: "Confirm Self-Assignment to " + buttonProps.proposalTitle,
            centered: true,
            children: (
                <Text size={"sm"} c={"orange"}>
                    This will assign you as a reviewer of the proposal {buttonProps.proposalTitle}.
                    Notice that only the TAC chair can then remove you as a reviewer from this proposal.

                    Please confirm this action.
                </Text>
            ),
            labels: {confirm: "Self-Assign", cancel: "No, do not self-assign"},
            confirmProps: {color: "orange"},
            onConfirm: () => handleAssign({...buttonProps})
        })
    }

    function TableRow(rowProps:{
        proposalId: number
        proposalTitle: string
    }) : ReactElement {

        return (
            <Table.Tr>
                <Table.Td>{rowProps.proposalTitle}</Table.Td>
                <Table.Td>
                    <Flex justify={"flex-end"}>
                        <AddButton
                            toolTipLabel={"Self-Assign as a reviewer to this proposal"}
                            label={"Self-Assign"}
                            onClick={() => confirmSelfAssign({
                                reviewerId: props.reviewerId,
                                proposalId: rowProps.proposalId,
                                proposalTitle: rowProps.proposalTitle
                            })}
                        />
                    </Flex>
                </Table.Td>
            </Table.Tr>
        )
    }

    const tableHeaders = (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Proposal Title</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const tableRows =
        props.notAssigned.map(sp => (
            <TableRow
                key={sp.dbid}
                proposalId={sp.dbid!}
                proposalTitle={sp.name!}
            />
        ))

    return (
        <Table>
            {tableHeaders}
            <Table.Tbody>
                {tableRows}
            </Table.Tbody>
        </Table>
    )
}