import {ReactElement, useEffect, useState} from "react";
import {Table, Loader, Modal, TextInput, Stack} from "@mantine/core";
import {
    ObjectIdentifier,
    SubmittedProposal,
} from "../../generated/proposalToolSchemas.ts";
import {
    fetchJustificationsResourceDownloadAdminZip,
    useSubmittedProposalResourceGetSubmittedProposal,
    useSubmittedProposalResourceReplaceCode
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import EditButton from "../../commonButtons/edit.tsx";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {notifyError, notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {ExportButton} from "../../commonButtons/export.tsx";
import {HaveRole} from "../../auth/Roles.tsx";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */


function downloadProposal(
    submittedProposal: SubmittedProposal,
    authToken: string | undefined,
): void {

    notifyInfo("Submitted Proposal Export Started",
        "An export has started and the download will begin shortly");

    // generate the zip file.
    fetchJustificationsResourceDownloadAdminZip({
        pathParams: {proposalCode: submittedProposal._id!},
        headers: {authorization: `${authToken}`}})
        .then((blob) => {
            // Create a download link for the zip file
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob as unknown as Blob);
            link.download=submittedProposal.proposalCode + " " + submittedProposal.title?.replace(/\s/g,"").substring(0,30)+".zip";
            link.click();
        })
        .then(()=>
            notifySuccess("Proposal Export Complete", "proposal exported and downloaded")
        )
        .catch((error:Error) =>
            notifyError("Proposal Export Failed", getErrorMessage(error))
        )
}


type SubmittedTableRowProps = {
    cycleCode: number,
    submittedProposalId: number,
    index: number
}

function SubmittedProposalTableRow(rowProps: SubmittedTableRowProps) : ReactElement {
    const codeMutation = useSubmittedProposalResourceReplaceCode();
    const {fetcherOptions} = useProposalToolContext();

    const submittedProposal =
        useSubmittedProposalResourceGetSubmittedProposal({
            pathParams: {
                cycleCode: rowProps.cycleCode,
                submittedProposalId: rowProps.submittedProposalId
            },
            headers: fetcherOptions.headers,
        })

    const [reviewsCompleteAndLocked, setReviewsCompleteAndLocked] = useState(false)
    const [proposalAccepted, setProposalAccepted] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const queryClient = useQueryClient();

    interface SubmittedProposalCode {
        code: string
    }
    const form = useForm<SubmittedProposalCode>({
        initialValues: {
            code: 'Loading...'
        },
        validate: {
            code: (value) =>
                value && value.length < 1 ? 'The code cannot be empty' : null
        }
    })

    const handleSubmit
        = form.onSubmit((val) => {
            codeMutation.mutate({
                pathParams: {cycleCode: rowProps.cycleCode,
                    submittedProposalId: rowProps.submittedProposalId
                },
                queryParams: {proposalCode: val.code}
            },
            {
                onSuccess: () => {
                    notifySuccess("Proposal Code Update", "Code updated");
                    queryClient.invalidateQueries({}).then();
                    setEditModalOpen(false);
                },
                onError: (error) => {
                    notifyError("Failed to change code", getErrorMessage(error))
                }
            })
        })

    useEffect(() => {
        if (submittedProposal.status === 'success') {
            form.values.code = submittedProposal.data?.proposalCode!;
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
    }, [submittedProposal.status]);

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
            <Modal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={"Change Proposal Code"}
            >
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label={"Proposal code"}
                            maxLength={MAX_CHARS_FOR_INPUTS}
                            {...form.getInputProps('code')}
                        />
                        <FormSubmitButton form={form} />
                    </Stack>
                </form>
            </Modal>
            <Table.Td>
                {HaveRole(["tac_admin"]) ? (<EditButton
                    toolTipLabel={'Change proposal code'}
                    label={submittedProposal.data?.proposalCode}
                    onClick={() => setEditModalOpen(true)}
                />) : (submittedProposal.data?.proposalCode) }
            </Table.Td>
            <Table.Td>{submittedProposal.data?.title}</Table.Td>
            {HaveRole(["tac_admin"]) && (<Table.Td>
                <ExportButton
                    onClick={() => downloadProposal(submittedProposal.data!, fetcherOptions.headers?.authorization)}
                    toolTipLabel={"Download a zip file of the PDF proposal and it's supporting documents"}
                    label={"Zip"}
                >
                </ExportButton>
            </Table.Td>)}
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
                    <Table.Th>Title</Table.Th>
                    {HaveRole(["tac_admin"]) && (<Table.Th>Download</Table.Th>)}
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