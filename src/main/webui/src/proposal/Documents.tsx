import {
    useSupportingDocumentResourceGetSupportingDocuments,
} from "../generated/proposalToolComponents";
import {useParams} from "react-router-dom";
import {Box, Button, FileButton, Table, Text} from "@mantine/core";
import {boxListStyles} from "../Styles";
import {useState} from "react";8

const DocumentsPanel = () => {
    const { selectedProposalCode} = useParams();//
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
            formData.append("file", file);

            try {
                const result = await fetch("http://127.0.0.1/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await result.json();

                console.log(data);
                setStatus("success");
            } catch (error) {
                console.error(error);
                setStatus("fail");
            }
        }
    };

    return (
        <Box>
            <Text fz="lg" fw={700}>View and retrieve documents</Text>
            <Box
                sx={boxListStyles}>
                {isLoading ? (`Loading...`)
                    : (
                        <pre>
                        {`${JSON.stringify(data, null, 2)}`}
                    </pre>
                    )}
            </Box>
            <Text fz="lg" fw={700}>Upload a document</Text>
            <FileButton onChange={setFile}>
                        {(props) => <Button {...props}>Choose a file</Button>}
            </FileButton>
            {file && (
                <Box sx={boxListStyles}>
                    File details:
                    <Table>
                        <tbody>
                            <tr><td>Name</td><td>{file.name}</td></tr>
                            <tr><td>Type</td><td>{file.type}</td></tr>
                            <tr><td>Size</td><td>{file.size} bytes</td></tr>
                        </tbody>
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

const Result = ({ status }: { status: string }) => {
    if (status === "success") {
        return <Text>✅ File uploaded successfully</Text>;
    } else if (status === "fail") {
        return <Text>❌ File upload failed</Text>;
    } else if (status === "uploading") {
        return <Text>⏳ Uploading selected file...</Text>;
    } else {
        return null;
    }
};

export default DocumentsPanel