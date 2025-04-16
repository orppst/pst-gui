import {
    useSupportingDocumentResourceDownloadSupportingDocument,
    useSupportingDocumentResourceGetSupportingDocuments,
    useSupportingDocumentResourceRemoveSupportingDocument,
    useSupportingDocumentResourceUploadSupportingDocument
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {Box, FileButton, Grid, Stack, Table, Text} from "@mantine/core";
import {SyntheticEvent, useEffect, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {randomId} from "@mantine/hooks";
import UploadButton from 'src/commonButtons/upload.tsx';
import DeleteButton from 'src/commonButtons/delete.tsx';
import CancelButton from "src/commonButtons/cancel.tsx";
import {
    DownloadButton
} from 'src/commonButtons/download.tsx';
import {HEADER_FONT_WEIGHT, JSON_SPACES, MAX_SUPPORTING_DOCUMENT_SIZE} from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

type DocumentProps = {
    dbid: number,
    name: string
}

const DocumentsPanel = () => {
    const queryClient = useQueryClient();
    const {selectedProposalCode} = useParams();
    const {fetcherOptions} = useProposalToolContext();

    const uploadDocument =
        useSupportingDocumentResourceUploadSupportingDocument();


    const {data, error, isLoading}
        = useSupportingDocumentResourceGetSupportingDocuments(
        {pathParams: {proposalCode: Number(selectedProposalCode)},},
        {enabled: true}
    );
    const [status, setStatus]
        = useState<"initial" | "uploading" | "success" | "fail">("initial");

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const handleUpload = async (chosenFile: File | null) => {
        if (chosenFile) {
            if(chosenFile.size > MAX_SUPPORTING_DOCUMENT_SIZE) {
                notifyError("File upload failed",
                    "The supporting document " + chosenFile.name
                        + " is too large. Maximum size is "
                        + MAX_SUPPORTING_DOCUMENT_SIZE/1024/1024 + "MB")
            } else {
                setStatus("uploading");

                const formData = new FormData();
                formData.append("document", chosenFile);
                formData.append("title", chosenFile.name);

                uploadDocument.mutate({
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    //@ts-ignore
                    body: formData,
                    //@ts-ignore
                    headers: {"Content-Type": "multipart/form-data", ...fetcherOptions.headers}
                }, {
                    onSuccess: () => {
                        setStatus("success");
                        queryClient.invalidateQueries();
                        notifySuccess("Upload successful", "The supporting document has been uploaded");
                    },
                    onError: (error) => {
                        setStatus("fail");
                        notifyError("Upload failed", getErrorMessage(error));
                    },
                })
            }
        }
    };
  const navigate = useNavigate();

  function handleCancel(event: SyntheticEvent) {
      event.preventDefault();
      navigate("../",{relative:"path"})
      }
    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Documents"} />
            <ContextualHelpButton messageId="ManageDocs" />
            <Stack>
                <Table>
                    <Table.Tbody>
                    {isLoading ? (
                        <Table.Tr>
                            <Table.Td>Loading...</Table.Td>
                        </Table.Tr>)
                    : data?.map((item) => {
                            if (item.dbid !== undefined && item.name !== undefined)
                                return (<RenderDocumentListItem
                                    key={item.dbid}
                                    dbid={item.dbid}
                                    name={item.name}/>)
                            else
                                return (
                                    <Table.Tr key={randomId()}>
                                        <Table.Td>Empty!</Table.Td>
                                    </Table.Tr>)
                        })
                    }
                    </Table.Tbody>
                </Table>

                <Text fz="lg" fw={HEADER_FONT_WEIGHT}>Upload a document</Text>
                            <p> </p>
                            <Grid>
                              <Grid.Col span={8}></Grid.Col>
                <FileButton onChange={handleUpload}>
                            {(props) => <UploadButton
                                toolTipLabel="select a file from disk to upload"
                                label={"Choose a file"}
                                onClick={props.onClick}/>}
                </FileButton>
                <CancelButton
                    onClickEvent={handleCancel}
                    toolTipLabel={"Go back without saving"}/>
                </Grid>
                <Result status={status} />
            </Stack>
        </PanelFrame>
    );
};

function RenderDocumentListItem(props: DocumentProps) {
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [downloadLink, setDownloadLink] = useState("");
    const [downloadReady, setDownloadReady] = useState(false);

    const removeDocument =
        useSupportingDocumentResourceRemoveSupportingDocument();

    const downloadDocument =
        useSupportingDocumentResourceDownloadSupportingDocument({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                id: props.dbid
            }
        })

    useEffect(() => {
        if (downloadDocument.status === 'success') {
            setDownloadReady(true);
            setDownloadLink(
                window.URL.createObjectURL(downloadDocument.data as unknown as Blob)
            );
        }
    }, [downloadDocument.status])

    function handleRemove() {
        setSubmitting(true);
        removeDocument.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                id: Number(props.dbid),
            }
        }, {
            onSuccess: () => {
                setSubmitting(false);
                queryClient.invalidateQueries().then();
                notifySuccess("Removed", "The supporting document has been removed");
            },
            onError: (error) => {
                setSubmitting(false);
                notifyError("Failed to Removed Document", getErrorMessage(error));
            },
        })
    }

    const confirmDocumentRemoval = () =>
        modals.openConfirmModal({
            title: "Remove document",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove the document {props.name} from this proposal?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove(),
        });

    if(submitting)
        return (
            <Table.Tr key={props.dbid}>
                <Table.Td>DELETING...</Table.Td>
            </Table.Tr>);
    else
        return (
                <Table.Tr key={props.dbid}>
                    <Table.Td>{props.name}</Table.Td>
                    {downloadReady &&
                        <Table.Td align={"right"}>
                            <DownloadButton
                                download={props.name}
                                toolTipLabel={"Download selected file."}
                                href={downloadLink}/>
                        </Table.Td>
                    }
                    <Table.Td align={"left"}>
                        <DeleteButton onClick={confirmDocumentRemoval}
                                      toolTipLabel={"Remove this document."}
                                      label={"Remove"}/>
                    </Table.Td>
                </Table.Tr>
            );
}

const Result = ({ status }: { status: string }) => {
    if (status === "success") {
        return null;
    } else if (status === "fail") {
        return <Text>❌ File upload failed</Text>;
    } else if (status === "uploading") {
        return <Text>⏳ Uploading selected file...</Text>;
    } else {
        return null;
    }
};

export default DocumentsPanel