import {ReactElement, useEffect, useState} from "react";
import {
    Button, Checkbox,
    Fieldset,
    FileButton,
    Grid, Group, Loader,
    ScrollArea,
    Stack,
    Table,
    Text,
    Textarea
} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";
import {
    fetchJustificationsResourceAddLatexResourceFile, fetchJustificationsResourceCheckForPdf,
    fetchJustificationsResourceCreatePDFLaTex,
    fetchJustificationsResourceDownloadLatexPdf,
    fetchJustificationsResourceGetLatexResourceFiles,
    fetchJustificationsResourceRemoveLatexResourceFile,
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {IconArrowBigRightLines, IconPdf, IconSquareRoundedArrowDown} from "@tabler/icons-react";
import {MAX_SUPPORTING_DOCUMENT_SIZE} from "../../constants.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {modals} from "@mantine/modals";
import RemoveButton from "../../commonButtons/remove.tsx";

export default
function JustificationLatex({which} : {which: string} ) : ReactElement {

    const { selectedProposalCode } = useParams();

    const [resourceFiles, setResourceFiles] = useState<string[]>([])
    const [pdfDownLoad, setPdfDownload] = useState("");
    const [latexStatus, setLatexStatus] = useState("");

    //count tracks files uploaded and removed
    const [count, setCount] = useState(0);
    const [pdfOutputExists, setPdfOutputExists] = useState(false)
    const [downloadReady, setDownloadReady] = useState(false)
    const [warningsAsErrors, setWarningsAsErrors] = useState(true)
    const [loading, setLoading] = useState(false)

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

    useEffect(() => {
        fetchJustificationsResourceCheckForPdf({
            pathParams: {proposalCode: Number(selectedProposalCode), which: which}
        })
            .then((data) => {
                setPdfOutputExists(data as unknown as boolean);
            })
            .catch((error) =>
                notifyError("Fail on PDF output check", getErrorMessage(error))
            )
    }, [latexStatus]);

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

    const handleCompile = () => {
        setLoading(true);

        fetchJustificationsResourceCreatePDFLaTex({
            pathParams: {proposalCode: Number(selectedProposalCode), which: which},
            queryParams: {warningsAsErrors: warningsAsErrors}
        })
            .then((data) => {
                setLatexStatus(data as unknown as string)
            })
            .catch((error) => notifyError("Failed to compile", getErrorMessage(error)))
            .finally(() => setLoading(false))
    }

    const prepareDownload = () => {
        fetchJustificationsResourceDownloadLatexPdf({
            pathParams: {proposalCode: Number(selectedProposalCode), which: which},
        })
            .then((blob) => setPdfDownload(
                window.URL.createObjectURL(blob as unknown as Blob)
            ))
            .then(() => setDownloadReady(true))
            .catch((error) => {
                notifyError("Failed to download PDF", getErrorMessage(error))
            })
    }


    //Dev note: I would like to use the 'accept={"<content-type>"}' property of FileButton but cannot
    //identify the correct string for *.bib files, tried 'application/x-bibtex' and 'application/octet-stream'

    //onClick={() => setWarningsAsErrors(!warningsAsErrors)}
    return (
        <Grid columns={10}>
            <Grid.Col span={{base: 10, md: 6}}>
                <Fieldset legend={"Compile Sources"}>
                    <Stack>
                        <Group grow>
                            <Button
                                rightSection={<IconArrowBigRightLines />}
                                onClick={handleCompile}
                                color={"green"}
                            >
                                {
                                    loading ? <Loader size={"sm"}/> :
                                        "Compile to PDF"
                                }
                            </Button>
                            <Checkbox
                                description={"Warnings as errors (recommended)"}
                                checked={warningsAsErrors}
                                onChange={(event)=> {
                                    setWarningsAsErrors(event.currentTarget.checked)
                                }}
                            />
                        </Group>

                        <Textarea
                            value={latexStatus}
                            autosize
                            minRows={21}
                            maxRows={21}
                        />
                        {
                            downloadReady ?
                                <Button
                                    rightSection={<IconPdf />}
                                    component={"a"}
                                    download={which + "-justification.pdf"}
                                    href={pdfDownLoad}
                                    color={"blue"}
                                >
                                    Download
                                </Button> :
                                <Button
                                    rightSection={<IconSquareRoundedArrowDown />}
                                    onClick={prepareDownload}
                                    disabled={!pdfOutputExists}
                                >
                                    Request PDF download
                                </Button>
                        }
                    </Stack>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={{base: 10, md: 4}}>
                <Fieldset legend={"Upload Files"}>
                <Stack>
                    <ScrollArea h={526}>
                        <Table>
                            {resourceFilesHeader()}
                            {resourceFilesBody()}
                        </Table>
                    </ScrollArea>
                    <FileButton
                        onChange={handleUpload}
                    >
                        {
                            (props) =>
                                <UploadButton
                                    toolTipLabel={"upload file: .bib, .png, .jpg only"}
                                    label={"Choose a file"}
                                    onClick={props.onClick}
                                    variant={"filled"}
                                />
                        }
                    </FileButton>
                </Stack>
                </Fieldset>
            </Grid.Col>
        </Grid>
    )
}