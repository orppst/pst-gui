import JSZip from 'jszip';
import { ObservingProposal } from 'src/generated/proposalToolSchemas.ts';
import {
    JSON_FILE_NAME, OVERVIEW_PDF_FILENAME, MAX_SUPPORTING_DOCUMENT_SIZE
} from 'src/constants.tsx';
import {
    fetchProposalResourceImportProposal,
    fetchSupportingDocumentResourceUploadSupportingDocument,
} from 'src/generated/proposalToolComponents.ts';
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {QueryClient} from "@tanstack/react-query";

/**
 * Upload a document in a zip file to the given proposal.
 *
 * @param {number} proposalCode the proposal to upload against
 * @param {JSZip} zip zip file containing the supporting documents
 * @param {string} filename filename of the supporting document
 * @param {string} authToken authorization token from caller
 */
const UploadADocument =
    (proposalCode: number, zip: JSZip, filename: string, authToken: string) => {
    const formData = new FormData();
    console.log("Upload supporting document " + filename);
    zip.file(filename)!.async('blob')
        .then((document) => {
            if(document.size > MAX_SUPPORTING_DOCUMENT_SIZE) {
                throw {message: "The supporting document " + filename
                        + " is too large. Maximum size of zip is "
                        + MAX_SUPPORTING_DOCUMENT_SIZE/1024/1024 + "MB"};
            } else {
                formData.append("title", filename);
                formData.append("document", document);
                fetchSupportingDocumentResourceUploadSupportingDocument(
                    {
                        //@ts-ignore
                        body: formData,
                        pathParams: {proposalCode: proposalCode},
                        headers: {
                            authorization: `Bearer ${authToken}`,
                            // @ts-ignore
                            "Content-Type": "multipart/form-data"
                        }
                    },
                )
                    .catch((error) => {
                        throw error;
                    })
            }
        });
};

/**
 * sends the proposal json to API, then uploads all other documents in the zip.
 *
 * @param {ObservingProposal} observingProposal the observing proposal to be imported
 * @param {JSZip} zip zip file containing any supporting documents
 * @param {string} authToken authorization token from caller
 * @param {QueryClient} queryClient the query client from caller
 */
export
function SendToImportAPI(
    observingProposal: ObservingProposal,
    zip: JSZip,
    authToken: string,
    queryClient: QueryClient
) {
    //Files to skip
    const skipFiles
        = new RegExp("^Thumbs.db$|^__MACOS|^.DS_Store$|^"
        + OVERVIEW_PDF_FILENAME + "$");

    fetchProposalResourceImportProposal({
        body: observingProposal,
        headers: {authorization: `Bearer ${authToken}`}
    })
        .then((uploadedProposal) => {
            Object.keys(zip.files).forEach(function (filename) {
                if (filename !== JSON_FILE_NAME && !skipFiles.test(filename)) {
                    UploadADocument(Number(uploadedProposal._id), zip, filename, authToken);
                }
            })
        })
        .then(() => {
            queryClient.invalidateQueries({
                queryKey: ['pst', 'api', 'proposals']
            }).then(() => {
                notifySuccess("Upload successful", "The proposal has been uploaded")
            })
        })
        .catch((error) => {
            notifyError("Upload failed", getErrorMessage(error));
        })
}

