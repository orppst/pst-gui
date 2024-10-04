import {ReactElement, useEffect, useState} from "react";
import {Button, FileButton, Group, ScrollArea, Table, Text} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";
import {
    fetchJustificationsResourceAddLatexResourceFile,
    fetchJustificationsResourceGetLatexResourceFiles,
    fetchJustificationsResourceRemoveLatexResourceFile,
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import DeleteButton from "../../commonButtons/delete.tsx";
import {IconPdf, IconSkull} from "@tabler/icons-react";
import {MAX_SUPPORTING_DOCUMENT_SIZE} from "../../constants.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {modals} from "@mantine/modals";

export default
function JustificationLatex({which} : {which: string} ) : ReactElement {

    /*
        Requirements:
        - Upload button
        - Compile button
        - Download button
        - Display list of uploaded files each with a delete button
        - Text area to show results of compilation
     */
    const { selectedProposalCode } = useParams();

    const [resourceFiles, setResourceFiles] = useState<string[]>([])

    //count tracks files uploaded and removed
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetchJustificationsResourceGetLatexResourceFiles({
            pathParams: {proposalCode: Number(selectedProposalCode), which: which}
        })
            .then((data) => {
                setResourceFiles(data)
            })
            .catch((error) => {
                notifyError("Failed to fetch uploaded files", getErrorMessage(error))
            })
    }, [count]);

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
            {resourceFiles.map((uploadedFile) => {
                return (
                    <Table.Tr key={uploadedFile}>
                        <Table.Td>
                            {uploadedFile}
                        </Table.Td>
                        <Table.Td>
                            <DeleteButton
                                toolTipLabel={"remove this file"}
                                onClick={() => openRemoveFileConfirmModal(uploadedFile)}
                            />
                        </Table.Td>
                    </Table.Tr>
                )
            } )}
        </Table.Tbody>
    )

    //argument expected to have type 'File | null'
    const handleUpload = (fileToUpload: File | null) => {
        if (fileToUpload) {
            if (fileToUpload.size > MAX_SUPPORTING_DOCUMENT_SIZE) {
                notifyError("File upload failed", "The file " + fileToUpload.name
                    + " is too large at " + fileToUpload.size/1024/1024
                    + "MB. Maximum size is "
                    + MAX_SUPPORTING_DOCUMENT_SIZE/1024/1024 + "MB")
            } else {
                const formData = new FormData();
                formData.append("document", fileToUpload);

                fetchJustificationsResourceAddLatexResourceFile(
                    {
                        //@ts-ignore
                        body: formData,
                        pathParams: {proposalCode: Number(selectedProposalCode), which: which},
                        //@ts-ignore
                        headers: {"Content-Type": "multipart/form-data"}
                    }
                )
                    .then(() => {
                        notifySuccess("Upload successful", fileToUpload.name + " has been saved")
                        setCount(count + 1); //trigger re-fetch of uploaded files
                    })
                    .catch((error) => {
                        notifyError("Upload failed", getErrorMessage(error))
                    })
            }
        } else {
            notifyError("Unexpected error", "failed to open file for upload");
        }
    }

    const handleRemoveFile = (fileName: string) => {
        fetchJustificationsResourceRemoveLatexResourceFile(
            {
                pathParams:{proposalCode:Number(selectedProposalCode), which: which},
                //@ts-ignore
                body: fileName,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }
        )
            .then( () => {
                notifySuccess("Removed file", "File: " + fileName + " deleted")
                setCount(count - 1) //maintain the count, re-trigger fetch of uploaded files
            })
            .catch((error) => {
                notifyError("Deletion Failed", getErrorMessage(error))
            })
    }

    const openRemoveFileConfirmModal = (fileName: string) =>
        modals.openConfirmModal({
            title: "Are you sure you want to remove " + fileName + "?",
            centered: true,
            children: (
                <Text size={"sm"}>
                    This will delete the file from the server. Please confirm action.
                </Text>
            ),
            labels: {confirm: "Delete", cancel: "No, don't remove"},
            confirmProps: {color: "red"},
            onConfirm: () => handleRemoveFile(fileName)
        })

    const handleCompile = () => {console.log("compile clicked")}

    const handleDownload = () => {console.log("download clicked")}


    //Dev note: I would like to use the 'accept={"<content-type>"}' property of FileButton but cannot
    //identify the correct string for *.bib files, tried 'application/x-bibtex' and 'application/octet-stream'

    return (
        <>
            <ScrollArea h={150}>
                <Table>
                    {resourceFilesHeader()}
                    {resourceFilesBody()}
                </Table>
            </ScrollArea>

            <Group grow>
                <FileButton
                    onChange={handleUpload}
                >
                    {
                        (props) =>
                            <UploadButton
                                toolTipLabel={"upload file: .bib, .png, .jpg"}
                                label={"Upload"}
                                onClick={props.onClick}
                                variant={"filled"}
                            />
                    }
                </FileButton>
                <Button
                    rightSection={<IconSkull />}
                    onClick={handleCompile}
                >
                    Compile
                </Button>
                <Button
                    rightSection={<IconPdf />}
                    onClick={handleDownload}
                >
                    Download
                </Button>

            </Group>
        </>
    )
}