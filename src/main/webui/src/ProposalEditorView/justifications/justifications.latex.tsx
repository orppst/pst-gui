import {ReactElement} from "react";
import {Button, Container, FileButton, Group, Loader, ScrollArea, Table} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";
import {
    fetchJustificationsResourceAddLatexResourceFile, fetchJustificationsResourceRemoveLatexResourceFile,
    useJustificationsResourceGetLatexResourceFiles
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import DeleteButton from "../../commonButtons/delete.tsx";
import {IconPdf, IconSkull} from "@tabler/icons-react";
import {MAX_SUPPORTING_DOCUMENT_SIZE} from "../../constants.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

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

    const uploadedFiles =
        useJustificationsResourceGetLatexResourceFiles(
            {pathParams: {proposalCode: Number(selectedProposalCode), which: which}}
    );

    if (uploadedFiles.error) {
        return(
            <Container>
                Error finding uploaded Latex resource files
            </Container>
        )
    }

    if (uploadedFiles.isLoading) {
        return (
            <Loader color={"orange"}/>
        )
    }

    const resourceFilesHeader = () : ReactElement => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Resource Files</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    //uploadedFile name will be unique to this Justification
    const resourceFilesBody = () : ReactElement => (
        <Table.Tbody>
            {uploadedFiles.data?.map((uploadedFile) => {
                return (
                    <Table.Tr key={uploadedFile}>
                        <Table.Td>
                            {uploadedFile}
                        </Table.Td>
                        <Table.Td>
                            <DeleteButton
                                toolTipLabel={"remove this file"}
                                onClick={() => handleRemoveFile(uploadedFile)}
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
            })
            .catch((error) => {
                notifyError("Deletion Failed", getErrorMessage(error))
            })
    }

    const handleCompile = () => {console.log("compile clicked")}

    const handleDownload = () => {console.log("download clicked")}

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