import {ReactElement, useEffect, useState} from "react";
import {Table, Loader, Modal, TextInput, Stack} from "@mantine/core";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {
    useSubmittedProposalResourceGetSubmittedProposal,
    useSubmittedProposalResourceReplaceCode
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import EditButton from "../../commonButtons/edit.tsx";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */

type SubmittedTableRowProps = {
    cycleCode: number,
    submittedProposalId: number,
    index: number
}

const codeMutation = useSubmittedProposalResourceReplaceCode();

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
    const [editModalOpen, setEditModalOpen] = useState(false)
    const queryClient = useQueryClient();

    const EditCodeModal = () => {
        interface SubmittedProposalCode {
            code: string
        }
        const form = useForm<SubmittedProposalCode>({
            mode: "controlled",
            initialValues: {
                code: submittedProposal.data?.proposalCode!
            },
            validate: {
                code: (value) =>
                    value && value.length < 1 ? 'The code cannot be empty' : null
            }
        })

        const handleSubmit
            = form.onSubmit((values) => {
                codeMutation.mutate({
                    pathParams: {cycleCode: rowProps.cycleCode,
                        submittedProposalId: rowProps.submittedProposalId
                    },
                    queryParams: {proposalCode: values.code}
                },
                {
                    onSuccess: () => {
                        notifySuccess("Proposal Code Update", "success");
                        queryClient.invalidateQueries({}).then();
                        setReviewsCompleteAndLocked(false)
                    },
                    onError: (error) => {
                        notifyError("Failed to change code", getErrorMessage(error))
                        setReviewsCompleteAndLocked(false)
                    }
                })
            })

        return (
            <Modal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={"Change Proposal Code"}
            >
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label={"Proposal code"}
                            name="Proposal code"
                            maxLength={MAX_CHARS_FOR_INPUTS}
                            {...form.getInputProps('proposalCode')}
                            />
                        <FormSubmitButton form={form}></FormSubmitButton>
                    </Stack>
                </form>
            </Modal>
        )
    };

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
            <EditCodeModal/>
            <Table.Td>
                <EditButton
                    toolTipLabel={'Change proposal code'}
                    label={submittedProposal.data?.proposalCode}
                    onClick={() => setEditModalOpen(true)}
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