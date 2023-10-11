import {
    fetchSupportingDocumentResourceRemoveSupportingDocument,
    fetchSupportingDocumentResourceUploadSupportingDocument,
    useSupportingDocumentResourceGetSupportingDocuments
} from "../generated/proposalToolComponents";
import {useParams} from "react-router-dom";
import {Box, Button, FileButton, Table, Text} from "@mantine/core";
import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {notifications} from "@mantine/notifications";

type DocumentProps = {
    dbid: number,
    name: string
}

const DocumentsPanel = () => {
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();
    const { data , error, isLoading } = useSupportingDocumentResourceGetSupportingDocuments({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<
        "initial" | "uploading" | "success" | "fail"
    >("initial");


    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    const handleUpload = async () => {
        if (file) {
            setStatus("uploading");

            const formData = new FormData();
            formData.append("document", file);
            formData.append("title", file.name);

            fetchSupportingDocumentResourceUploadSupportingDocument(
                {
                    // @ts-ignore
                    body: formData,
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    // @ts-ignore
                    headers: {"Content-Type": "multipart/form-data"}
                }
            ).then((data) => console.log(data))
                .then(() => {
                    setStatus("success");
                    queryClient.invalidateQueries();
                    setFile(null);
                    notifications.show({
                        withCloseButton: true,
                        autoClose: 5000,
                        title: "Upload successful",
                        message: 'The supporting document has been uploaded',
                        color: 'green',
                        className: 'my-notification-class',
                        loading: false,
                    });
                })
                .catch((error) => {
                    console.log(error);
                    setStatus("fail");
                    notifications.show({
                        withCloseButton: true,
                        autoClose: 5000,
                        title: "Upload failed",
                        message: 'The supporting document has not been uploaded',
                        color: 'red',
                        className: 'my-notification-class',
                        loading: false,
                    });
                })
        }
    };

    return (
        <Box>
            <Text fz="lg" fw={700}>View and retrieve documents</Text>
            <Box>
                <Table>
                    <Table.Tbody>
                    {isLoading ? (<Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>)
                    : data?.map((item) => {
                            if (item.dbid !== undefined && item.name !== undefined)
                                return (<RenderDocumentListItem dbid={item.dbid} name={item.name}/>)
                            else
                                return (<Table.Tr><Table.Td>Empty!</Table.Td></Table.Tr>)
                        })
                    }
                    </Table.Tbody>
                </Table>
            </Box>
            <Text fz="lg" fw={700}>Upload a document</Text>
            <FileButton onChange={setFile}>
                        {(props) => <Button {...props}>Choose a file</Button>}
            </FileButton>
            {file && (
                <Box>
                    File details:
                    <Table>
                        <Table.Tbody>
                            <Table.Tr><Table.Td>Name</Table.Td><Table.Td>{file.name}</Table.Td></Table.Tr>
                            <Table.Tr><Table.Td>Type</Table.Td><Table.Td>{file.type}</Table.Td></Table.Tr>
                            <Table.Tr><Table.Td>Size</Table.Td><Table.Td>{file.size} bytes</Table.Td></Table.Tr>
                        </Table.Tbody>
                    </Table>
                </Box>
            )}

            {file && (
                <Button onClick={handleUpload} >
                    Upload file
                </Button>
            )}

            <Result status={status} />
        </Box>
    );
};

function RenderDocumentListItem(props: DocumentProps) {
    const queryClient = useQueryClient();
    const { selectedProposalCode} = useParams();
    const [submitting, setSubmitting] = useState(false);

    function handleRemove() {
        setSubmitting(true);
        fetchSupportingDocumentResourceRemoveSupportingDocument({pathParams:
                {
                    id: props.dbid,
                    proposalCode: Number(selectedProposalCode),
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries())
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

    if(submitting)
        return (<Table.Tr><Table.Td>DELETING...</Table.Td></Table.Tr>);
    else
        return (
                <Table.Tr>
                    <Table.Td>{props.name}</Table.Td>
                    <Table.Td><Button color={"red"} align={"right"} onClick={openRemoveModal}>Remove</Button></Table.Td>
                </Table.Tr>
            );
}

const Result = ({ status }: { status: string }) => {
    if (status === "success") {
        return null;
    } else if (status === "fail") {
        return <Text>❌ File upload failed, please contact your administrator</Text>;
    } else if (status === "uploading") {
        return <Text>⏳ Uploading selected file...</Text>;
    } else {
        return null;
    }
};

export default DocumentsPanel