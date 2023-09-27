import {
    useSupportingDocumentResourceGetSupportingDocuments,
} from "../generated/proposalToolComponents";
import {useParams} from "react-router-dom";
import {Box, Button, Input, Table, Text} from "@mantine/core";
import {boxAddNewStyles, boxListStyles} from "../Styles";
import {useState} from "react";

function oldDocumentsPanel() {
    const { selectedProposalCode} = useParams();//
    const { data , error, isLoading } = useSupportingDocumentResourceGetSupportingDocuments({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    return (
        <Box>
            <Text fz="lg" fw={700}>This is where upload and download of documents will happen</Text>
            <Box
                sx={boxListStyles}>
                {isLoading ? (`Loading...`)
                    : (
                        <pre>
                            {`${JSON.stringify(data, null, 2)}`}
                        </pre>
                    )}
            </Box>
        </Box>
    );

}

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
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setStatus("initial");
            setFile(e.target.files[0]);
        }
    };

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
                <Input label="Choose a file" id="file" type="file" onChange={handleFileChange} />
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
        return <p>✅ File uploaded successfully</p>;
    } else if (status === "fail") {
        return <p>❌ File upload failed</p>;
    } else if (status === "uploading") {
        return <p>⏳ Uploading selected file...</p>;
    } else {
        return null;
    }
};

export default DocumentsPanel