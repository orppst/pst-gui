import {
    useSupportingDocumentResourceGetSupportingDocuments,
} from "../generated/proposalToolComponents";
import {useParams} from "react-router-dom";
import {Box, Text} from "@mantine/core";

function DocumentsPanel() {
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
            <Box>
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

export default DocumentsPanel