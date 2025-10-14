import {ReactElement} from "react";
import {Fieldset, FileButton, Loader, ScrollArea, Stack, Table, Text} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";
import {useParams} from "react-router-dom";
import RemoveButton from "../../commonButtons/remove.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {modals} from "@mantine/modals";
import {useQueryClient} from "@tanstack/react-query";
import {MAX_SUPPORTING_DOCUMENT_SIZE} from "../../constants.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {
    useSupportingDocumentResourceGetSupportingDocuments, useSupportingDocumentResourceRemoveSupportingDocument,
    useSupportingDocumentResourceUploadSupportingDocument
} from "../../generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

export default
function JustificationsResourceFiles(
    {vpHeight} : {vpHeight: number}
) : ReactElement {

    const { selectedProposalCode } = useParams();
    const {fetcherOptions} = useProposalToolContext();

    const queryClient = useQueryClient();

    const resourceFiles =
        useSupportingDocumentResourceGetSupportingDocuments({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        })

    const addResourceFile =
        useSupportingDocumentResourceUploadSupportingDocument();

    const removeResourceFile =
        useSupportingDocumentResourceRemoveSupportingDocument();

    const resourceFilesHeader = () : ReactElement => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Resource Files</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    //uploadedFile names are unique within Justifications
    const resourceFilesBody = () : ReactElement => (
        <Table.Tbody>
            {resourceFiles.data?.map((uploadedFile) => {
                return (
                    <Table.Tr key={uploadedFile.dbid}>
                        <Table.Td>{uploadedFile.name}</Table.Td>
                        <Table.Td align={"right"}>
                            <RemoveButton
                                toolTipLabel={"remove this file"}
                                onClick={() => openRemoveFileConfirmModal(uploadedFile)}
                            />
                        </Table.Td>
                    </Table.Tr>
                )
            } )}
        </Table.Tbody>
    )

    const handleUploadResource = (fileToUpload: File | null) => {
        if (fileToUpload) {
            if (fileToUpload.size > MAX_SUPPORTING_DOCUMENT_SIZE) {
                notifyError("File upload failed", "The file " + fileToUpload.name
                    + " is too large at " + fileToUpload.size/1024/1024
                    + "MB. Maximum size is "
                    + MAX_SUPPORTING_DOCUMENT_SIZE/1024/1024 + "MB")
            } else {
                const formData = new FormData();
                formData.append("document", fileToUpload);

                addResourceFile.mutate({
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    //@ts-ignore
                    body: formData,
                    //@ts-ignore
                    headers: {"Content-Type": "multipart/form-data", ...fetcherOptions.headers}
                }, {
                    onSuccess: () => {
                        notifySuccess("Upload successful", fileToUpload.name + " has been saved")
                        queryClient.invalidateQueries().then();
                    },
                    onError: (error) => {
                        notifyError("Upload failed", getErrorMessage(error))
                    }
                })
            }
        } else {
            notifyError("Unexpected error", "failed to open file for upload");
        }
    }

    const handleRemoveFile = (file: ObjectIdentifier) => {
        removeResourceFile.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode), id: file.dbid!},
        }, {
            onSuccess: () => {
                notifySuccess("Removed file", "File: " + file.name + " deleted")
                queryClient.invalidateQueries().then();
            },
            onError: (error) => {
                notifyError("Deletion Failed", getErrorMessage(error))
            }
        })
    }

    const openRemoveFileConfirmModal = (file: ObjectIdentifier) =>
        modals.openConfirmModal({
            title: "Are you sure you want to remove " + file.name + "?",
            centered: true,
            children: (
                <Text size={"sm"}>
                    This will delete the file from the server. Please confirm action.
                </Text>
            ),
            labels: {confirm: "Delete", cancel: "No, don't remove"},
            confirmProps: {color: "red"},
            onConfirm: () => handleRemoveFile(file)
        })

    if (resourceFiles.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load resource files"}
                error={getErrorMessage(resourceFiles.error)}
            />
        )
    }

    return (
        <Fieldset legend={"Upload Resource Files"}>
            <Stack>
                <ScrollArea h={vpHeight * 0.52}>
                    <Table>
                        {resourceFilesHeader()}
                        {resourceFiles.isLoading ? <Loader/> : resourceFilesBody()}
                    </Table>
                </ScrollArea>
                <FileButton
                    onChange={handleUploadResource}
                >
                    {
                        (props) =>
                            <UploadButton
                                toolTipLabel={"upload resource file: .bib, .png, .jpg, .eps, .pdf only"}
                                label={"Add a Resource File"}
                                onClick={props.onClick}
                                variant={"filled"}
                            />
                    }
                </FileButton>
            </Stack>
        </Fieldset>
    )
}