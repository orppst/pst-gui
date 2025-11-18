import {ReactElement, useEffect, useState} from "react";
import {Table, Loader, Modal, TextInput, Stack} from "@mantine/core";
import {
    ObjectIdentifier,
    SubmittedProposal,
} from "../../generated/proposalToolSchemas.ts";
import {
    fetchJustificationsResourceCreateTACAdminPDF, fetchJustificationsResourceDownloadLatexPdf,
    fetchProposalResourceExportProposal,
    fetchSupportingDocumentResourceDownloadSupportingDocument,
    fetchSupportingDocumentResourceGetSupportingDocuments,
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
import {JSON_FILE_NAME, MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import * as JSZip from "jszip";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {ExportButton} from "../../commonButtons/export.tsx";

/*
    We will likely want to add metadata about submitted proposals, the most useful of this being the
    submitted proposals current "status" e.g., under-review, reviewed - success/fail, allocated
 */

const populateSupportingDocuments = (
    zip: JSZip,
    supportingDocumentData: ObjectIdentifier[] | undefined,
    proposalCode: number,
    authToken: string | undefined
): Array<Promise<void>> => {
    if(supportingDocumentData === undefined) {
        return [];
    }
    return supportingDocumentData.map(async (item: ObjectIdentifier) => {
        if (item.dbid !== undefined && item.name !== undefined) {
            // have to destructure this, as otherwise risk of being undefined
            // detected later.
            let docTitle = item.name;

            // ensure that if the file exists already, that it's renamed to
            // avoid issues of overwriting itself in the zip.
            while (zip.files[docTitle]) {
                docTitle = docTitle + "1"
            }

            // extract the document and save into the zip.
            await fetchSupportingDocumentResourceDownloadSupportingDocument({
                headers: {authorization: `Bearer ${authToken}`},
                pathParams: {
                    proposalCode: proposalCode,
                    id: item.dbid
                }
            })
                .then((blob) => {
                    // ensure we got some data back.
                    if (blob !== undefined) {
                        zip.file(docTitle, blob)
                    }
                })
        }
    });
}

function prepareToDownloadProposal(
    fullProposal: SubmittedProposal,
    authToken: string | undefined,
): void {
    if (fullProposal !== undefined && fullProposal._id !== undefined) {
        fetchJustificationsResourceCreateTACAdminPDF(
            {
                pathParams: {proposalCode: fullProposal._id},
                headers: {authorization: `${authToken}`},
            })
            .then(() => {
                //Pdf should now be generated, next get the supporting documents
                fetchSupportingDocumentResourceGetSupportingDocuments({
                    pathParams: {proposalCode: fullProposal._id!},
                    headers: {authorization: `${authToken}`},
                })
                    .then(documentList => {
                        // can go for a download of everything
                        downloadProposal(fullProposal, documentList, authToken)
                    })
                    .catch(e => {notifyError("Download Error", getErrorMessage(e));});
            })
            .catch((e) => {notifyError("Unable to compile pdf", getErrorMessage(e))});
    }
    else {
        notifyError("Download Error", "Submitted proposal is empty!");
    }
}

function downloadProposal(
    submittedProposal: SubmittedProposal,
    supportingDocuments: ObjectIdentifier[] | undefined,
    authToken: string | undefined,
): void {

    notifyInfo("Submitted Proposal Export Started",
        "An export has started and the download will begin shortly");

    // build the zip object and populate with the corresponding documents.
    let zip = new JSZip();

    // add supporting documents to the zip.
    const promises = populateSupportingDocuments(
        zip, supportingDocuments, submittedProposal._id!, authToken,
    );

    promises.push(
        fetchJustificationsResourceDownloadLatexPdf({
            pathParams: {proposalCode: submittedProposal._id!},
            headers: {authorization: `${authToken}`},
        }).then((blob) => {
            if (blob !== undefined) {
                zip.file(`${submittedProposal.proposalCode} ${submittedProposal.title?.replace(/\s/g, "").substring(0, 21)}.pdf`, blob)
            }
        })
    )

    // ensure all supporting docs populated before making zip.
    Promise.all(promises).then(
        () => {
            // generate the zip file.
            zip.generateAsync({type: "blob"})
                .then((zipData: Blob | MediaSource) => {
                    // Create a download link for the zip file
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(zipData);
                    link.download=submittedProposal.proposalCode + " " + submittedProposal.title?.replace(/\s/g,"").substring(0,21)+".zip";
                    link.click();
                })
                .then(()=>
                    notifySuccess("Proposal Export Complete", "proposal exported and downloaded")
                )
                .catch((error:Error) =>
                    notifyError("Proposal Export Failed", getErrorMessage(error))
                )
        }
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
                <EditButton
                    toolTipLabel={'Change proposal code'}
                    label={submittedProposal.data?.proposalCode}
                    onClick={() => setEditModalOpen(true)}
                />
            </Table.Td>
            <Table.Td>{submittedProposal.data?.title}</Table.Td>
            <Table.Td>
                <ExportButton
                    onClick={() => prepareToDownloadProposal(submittedProposal.data!, fetcherOptions.headers?.authorization)}
                    toolTipLabel={"Download a zip file of the PDF proposal and it's supporting documents"}
                    label={"Zip"}
                >
                </ExportButton>
            </Table.Td>
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
                    <Table.Th>Download</Table.Th>
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