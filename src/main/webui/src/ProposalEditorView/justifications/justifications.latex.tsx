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
    Textarea, Tooltip
} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";
import {
    fetchJustificationsResourceDownloadLatexPdf,
    useJustificationsResourceAddLatexResourceFile, useJustificationsResourceCheckForPdf,
    useJustificationsResourceCreatePDFLaTex,
    useJustificationsResourceGetLatexResourceFiles,
    useJustificationsResourceRemoveLatexResourceFile,
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {IconArrowBigRightLines, IconPdf} from "@tabler/icons-react";
import {CLOSE_DELAY, MAX_SUPPORTING_DOCUMENT_SIZE, OPEN_DELAY} from "../../constants.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {modals} from "@mantine/modals";
import RemoveButton from "../../commonButtons/remove.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {useQueryClient} from "@tanstack/react-query";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import {JustificationProps} from "./justifications.table.tsx";

export default
function JustificationLatex( p: JustificationProps ) : ReactElement {

    const { selectedProposalCode } = useParams();
    const {fetcherOptions} = useProposalToolContext();

    const queryClient = useQueryClient();

    //const [resourceFiles, setResourceFiles] = useState<string[]>([])
    const [pdfDownLoad, setPdfDownload] = useState("");
    const [latexStatus, setLatexStatus] = useState("");

    const [downloadReady, setDownloadReady] = useState(false)
    const [warningsAsErrors, setWarningsAsErrors] = useState(true)
    const [loading, setLoading] = useState(false)


    const addResourceFile =
        useJustificationsResourceAddLatexResourceFile();

    const removeResourceFile =
        useJustificationsResourceRemoveLatexResourceFile();

    const compileLaTeXOutput =
        useJustificationsResourceCreatePDFLaTex();


    const resourceFiles =
        useJustificationsResourceGetLatexResourceFiles({
            pathParams: {proposalCode: Number(selectedProposalCode), which: p.which}
        })

    const pdfOutputExists = useJustificationsResourceCheckForPdf({
        pathParams: {proposalCode: Number(selectedProposalCode), which: p.which}
    })

    // successful (re-)compilation OR the PDF already exists from a previous successful compilation
    useEffect(() => {
        if (pdfOutputExists.status === 'success') {
            if (latexStatus.includes('Latex compilation successful') ||
                pdfOutputExists.data as unknown as Boolean) {
                fetchJustificationsResourceDownloadLatexPdf({
                    ...fetcherOptions,
                    pathParams: {proposalCode: Number(selectedProposalCode), which: p.which},
                })
                    .then((blob) =>
                        setPdfDownload(window.URL.createObjectURL(blob as unknown as Blob)
                        ))
                    .then(() => setDownloadReady(true))
                    .catch((error) => {
                        notifyError("Failed to get latex output PDF", getErrorMessage(error))
                    })
            }
        }
    }, [latexStatus, pdfOutputExists]);

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

                addResourceFile.mutate({
                    pathParams: {proposalCode: Number(selectedProposalCode), which: p.which},
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

    const handleRemoveFile = (fileName: string) => {
        removeResourceFile.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode), which: p.which},
            //@ts-ignore
            body: fileName,
            //@ts-ignore
            headers: {"Content-Type": "text/plain", ...fetcherOptions.headers}
        }, {
            onSuccess: () => {
                notifySuccess("Removed file", "File: " + fileName + " deleted")
                queryClient.invalidateQueries().then();
            },
            onError: (error) => {
                notifyError("Deletion Failed", getErrorMessage(error))
            }
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
        setDownloadReady(false); //in case user is re-compiling

        compileLaTeXOutput.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode), which: p.which},
            queryParams: {warningsAsErrors: warningsAsErrors}
        }, {
            onSuccess: (data) => {
                setLatexStatus(data as unknown as string);
                setLoading(false);
            },
            onError: (error) => {
                setLoading(false); // otherwise spins FOREVER after error
                notifyError("Server error", getErrorMessage(error))
            }
        })
    }

    if (resourceFiles.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load resource files"}
                error={getErrorMessage(resourceFiles.error)}
            />
        )
    }

    //Dev note: I would like to use the 'accept={"<content-type>"}' property of FileButton but cannot
    //identify the correct string for *.bib files, tried 'application/x-bibtex' and 'application/octet-stream'

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
                        <Tooltip
                            label={downloadReady ?
                                "Download compiled output of your justification" :
                                "No output file found, successful compilation required"}
                            openDelay={OPEN_DELAY}
                            closeDelay={CLOSE_DELAY}
                        >
                            <Button
                                disabled={!downloadReady}
                                rightSection={<IconPdf />}
                                component={"a"}
                                download={p.which + "-justification.pdf"}
                                href={pdfDownLoad}
                                color={"blue"}
                            >
                                Download
                            </Button>
                        </Tooltip>
                    </Stack>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={{base: 10, md: 4}}>
                <Fieldset legend={"Upload Resource Files"}>
                <Stack>
                    <ScrollArea h={526}>
                        <Table>
                            {resourceFilesHeader()}
                            {
                                resourceFiles.isLoading ? <Loader/> :
                                resourceFilesBody()
                            }
                        </Table>
                    </ScrollArea>
                    <FileButton
                        onChange={handleUpload}
                    >
                        {
                            (props) =>
                                <UploadButton
                                    toolTipLabel={"upload resource file: .bib, .png, .jpg, .eps only"}
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