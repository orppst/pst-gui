import * as JSZip from 'jszip';
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

/**
 * Upload a document in a zip file to the given proposal.
 *
 * @param {number} proposalCode the proposal to upload against
 * @param {JSZip} zip zip file containing the supporting documents
 * @param {string} filename filename of the supporting document
 */
const UploadADocument = (proposalCode: number, zip: JSZip, filename: string) => {
    const formData = new FormData();
    console.log("Upload supporting document " + filename);
    zip.file(filename).async('blob')
        .then((document) => {
            if(document.size > MAX_SUPPORTING_DOCUMENT_SIZE) {
                notifyError("A file upload failed",
                    "The supporting document " + filename
                        + " is too large. Maximum size of zip is "
                        + MAX_SUPPORTING_DOCUMENT_SIZE/1024/1024 + "MB")
            } else {
                formData.append("title", filename);
                formData.append("document", document);
                fetchSupportingDocumentResourceUploadSupportingDocument(
                    {
                        //@ts-ignore
                        body: formData,
                        pathParams: {proposalCode: proposalCode},
                        // @ts-ignore
                        headers: {"Content-Type": "multipart/form-data"}
                    },
                )
                    .catch((error: { stack: { message: any; }; }) => {
                        notifyError("Upload a document failed", getErrorMessage(error));
                    })
            }
        });
};

/**
 * sends the proposal json to API, then uploads all other documents in the zip.
 *
 * @param {ObservingProposal} observingProposal the observing proposal to be imported
 * @param {JSZip} zip zip file containing any supporting documents
 */
const SendToImportAPI = (observingProposal: ObservingProposal, zip: JSZip)=> {
    //Files to skip
    const skipFiles
        = new RegExp("^Thumbs.db$|^__MACOS|^.DS_Store$|^"
        + OVERVIEW_PDF_FILENAME + "$");

    fetchProposalResourceImportProposal({body: observingProposal})
        .then((uploadedProposal) => {
            if (uploadedProposal._id === undefined) {
                notifyError("Upload failed", "An unidentified response from the API");
            } else {
                Object.keys(zip.files).forEach(function (filename) {
                    if (filename !== JSON_FILE_NAME && !skipFiles.test(filename)) {
                        UploadADocument(Number(uploadedProposal._id), zip, filename);
                    }
                })
                notifySuccess("Upload successful", "The proposal has been uploaded");
            }
        }).catch((error: { stack: { message: any; }; }) => {
            notifyError("Upload failed", getErrorMessage(error.stack.message));
        })
}

/**
 * Handles looking up a file and uploading it to the system.
 * @param {File} chosenFile the zip file containing a json representation
 * of the proposal and any supporting documents.
 */
export const handleUploadZip = async (chosenFile: File | null) => {
    // check for no file.
    if (chosenFile === null) {
        notifyError("Upload failed", "There was no file to upload")
    }

    // all simple checks done. Time to verify the internals of the zip.
    if (chosenFile !== null) {
        JSZip.loadAsync(chosenFile).then(function (zip) {
            // check the json file exists.
            if (!Object.keys(zip.files).includes(JSON_FILE_NAME)) {
                notifyError("Upload failed",
                    "There was no file called '"+JSON_FILE_NAME+"' within the zip")
            }

            // extract json data to import proposal definition.
            zip.files[JSON_FILE_NAME].async('text').then(function (fileData) {
                const jsonObject: ObservingProposal = JSON.parse(fileData)
                // ensure not undefined
                if (jsonObject) {
                    SendToImportAPI(jsonObject, zip);
                } else {
                    notifyError("Upload failed", "The JSON file failed to load correctly")
                }
            })
            .catch(() => {
                console.log("Unable to extract " + JSON_FILE_NAME + " from zip file");
                notifyError("Upload failed",
                    "Unable to extract " + JSON_FILE_NAME + " from zip file");
            })
        })
    }
}