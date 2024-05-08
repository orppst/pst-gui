import {
    fetchSupportingDocumentResourceDownloadSupportingDocument,
    fetchSupportingDocumentResourceRemoveSupportingDocument,
    fetchSupportingDocumentResourceUploadSupportingDocument,
    useSupportingDocumentResourceGetSupportingDocuments
} from "src/generated/proposalToolComponents";
import {useParams} from "react-router-dom";
import {Box, FileButton, Table, Text} from "@mantine/core";
import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {randomId} from "@mantine/hooks";
import UploadButton from 'src/commonButtons/upload.tsx';
import DeleteButton from 'src/commonButtons/delete.tsx';
import {
    DownloadButton,
    DownloadRequestButton
} from 'src/commonButtons/download.tsx';
import {HEADER_FONT_WEIGHT, JSON_SPACES, MAX_SUPPORTING_DOCUMENT_SIZE} from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

type DocumentProps = {
    dbid: number,
    name: string
}

const DocumentsPanel = () => {
    const queryClient = useQueryClient();
    const {selectedProposalCode} = useParams();
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

                fetchSupportingDocumentResourceUploadSupportingDocument(
                    {
                        // @ts-ignore
                        body: formData,
                        pathParams: {proposalCode: Number(selectedProposalCode)},
                        // @ts-ignore
                        headers: {"Content-Type": "multipart/form-data"}
                    }
                )
                    .then(() => {
                        setStatus("success");
                        queryClient.invalidateQueries();
                        notifySuccess("Upload successful", "The supporting document has been uploaded");
                    })
                    .catch((error) => {
                        setStatus("fail");
                        notifyError("Upload failed", getErrorMessage(error));
                    })
            }
        }
    };

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelTitle={"Documents"} />
            <Box>
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
            </Box>
            <Text fz="lg" fw={HEADER_FONT_WEIGHT}>Upload a document</Text>
            <FileButton onChange={handleUpload}>
                        {(props) => <UploadButton
                            toolTipLabel="select a file from disk to upload"
                            label={"Choose a file"}
                            onClick={props.onClick}/>}
            </FileButton>
            <Result status={status} />
        </PanelFrame>
    );
};

function RenderDocumentListItem(props: DocumentProps) {
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [downloadLink, setDownloadLink] = useState("");
    const [downloadReady, setDownloadReady] = useState(false);

    function handleRemove() {
        setSubmitting(true);
        fetchSupportingDocumentResourceRemoveSupportingDocument({pathParams:
                {
                    id: props.dbid,
                    proposalCode: Number(selectedProposalCode),
                }})
            .then(()=> {
                setSubmitting(false);
                queryClient.invalidateQueries().then();
                notifySuccess("Removed", "The supporting document has been removed");
            })
            .catch(console.log);
    }

    const openRemoveModal = () =>
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

    //TODO: Do we need to revoke this URL after use?
    const prepareDownload = () => {
        fetchSupportingDocumentResourceDownloadSupportingDocument(
            {pathParams: {
                id: props.dbid,
                    proposalCode: Number(selectedProposalCode)}})
            .then((blob) => setDownloadLink(
                window.URL.createObjectURL(blob as unknown as Blob)))
            .then(() => setDownloadReady(true));

    }

    if(submitting)
        return (
            <Table.Tr key={props.dbid}>
                <Table.Td>DELETING...</Table.Td>
            </Table.Tr>);
    else
        return (
                <Table.Tr key={props.dbid}>
                    <Table.Td>{props.name}</Table.Td>
                    {downloadReady?
                        <Table.Td align={"right"}>
                            <DownloadButton
                                download={props.name}
                                toolTipLabel={"Download selected file."}
                                href={downloadLink}/></Table.Td>
                        :<Table.Td align={"right"}>
                            <DownloadRequestButton
                                download={props.name}
                                toolTipLabel={'Request the file from the database.'}
                                onClick={prepareDownload}/>
                        </Table.Td>}
                    <Table.Td align={"left"}>
                        <DeleteButton onClick={openRemoveModal}
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