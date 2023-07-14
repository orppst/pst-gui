import { useContext } from "react";
import {UserContext} from '../App2'
import {
    useSupportingDocumentResourceGetSupportingDocuments,
} from "../generated/proposalToolComponents";

function DocumentsPanel() {
    const { selectedProposal } = useContext(UserContext);
    const { data , error, isLoading } = useSupportingDocumentResourceGetSupportingDocuments({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div>
            <h3>This is where upload and download of documents will happen</h3>
            <fieldset>
                {isLoading ? (`Loading...`)
                    : (
                        <pre>
                            {`${JSON.stringify(data, null, 2)}`}
                        </pre>
                    )}
            </fieldset>
        </div>
    );

}

export default DocumentsPanel