import * as JSZip from 'jszip';
import { notifications } from '@mantine/notifications';
import { ObservingProposal } from '../generated/proposalToolSchemas.ts';
import { JSON_FILE_NAME, MAX_SUPPORTING_DOCUMENT_SIZE } from '../constants.tsx';
import {
    fetchProposalResourceImportProposal,
    fetchSupportingDocumentResourceUploadSupportingDocument,
} from '../generated/proposalToolComponents.ts';
import {useQueryClient} from "@tanstack/react-query";

/**
 * Upload a document in a zip file to the given proposal.
 *
 * @param {number} proposalCode the proposal to upload against
 * @param {JSZip} zip zip file containing the supporting documents
 * @param {string} filename filename of the supporting document
 */
const UploadADocument = (proposalCode: number, zip: JSZip, filename: string) => {
    const formData = new FormData();
    zip.file(filename).async('blob')
        .then((document) => {
            if(document.size > MAX_SUPPORTING_DOCUMENT_SIZE) {
                notifications.show({
                    autoClose: 7000,
                    title: "A file upload failed",
                    message: "The supporting document " + filename
                        + " is too large. Maximum size of zip is "
                        + MAX_SUPPORTING_DOCUMENT_SIZE/1024/1024 + "MB",
                    color: 'red',
                    className: 'my-notification-class',
                })
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
                        notifications.show({
                            autoClose: 7000,
                            title: "Upload a document failed",
                            message: error.stack.message,
                            color: 'red',
                            className: 'my-notification-class',
                        })
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
     fetchProposalResourceImportProposal({body: observingProposal})
        .then((uploadedProposal) => {
            if(uploadedProposal._id === undefined) {
                notifications.show({
                    autoClose: 7000,
                    title: "Upload failed",
                    message: "An unidentified response from the API",
                    color: 'red',
                    className: 'my-notification-class',
                });
            } else {
                Object.keys(zip.files).forEach(function (filename) {
                        console.log("Found file " + filename);
                        if(filename !== JSON_FILE_NAME) {
                            UploadADocument(Number(uploadedProposal._id), zip, filename);
                        }
                    })
                notifications.show({
                    autoClose: 5000,
                    title: "Upload successful",
                    message: 'The proposal has been uploaded',
                    color: 'green',
                    className: 'my-notification-class',
                });
            }
        }).catch((error: { stack: { message: any; }; }) => {
        notifications.show({
            autoClose: 7000,
            title: "Upload failed",
            message: error.stack.message,
            color: 'red',
            className: 'my-notification-class',
        });
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
        notifications.show({
            autoClose: 7000,
            title: "Upload failed",
            message: `There was no file to upload`,
            color: 'red',
            className: 'my-notification-class',
        })
    }

    // all simple checks done. Time to verify the internals of the zip.
    if (chosenFile !== null) {
        JSZip.loadAsync(chosenFile).then(function (zip) {
            // check the json file exists.
            if (!Object.keys(zip.files).includes(JSON_FILE_NAME)) {
                notifications.show({
                    autoClose: 7000,
                    title: "Upload failed",
                    message: "There was no file called '"+JSON_FILE_NAME+"' within the zip",
                    color: 'red',
                    className: 'my-notification-class',
                })
            }

            // extract json data to check if its a submitted proposal.
            zip.files[JSON_FILE_NAME].async('text').then(function (fileData) {
                const jsonObject: ObservingProposal = JSON.parse(fileData)

                // ensure not undefined
                if (jsonObject) {
                    SendToImportAPI(jsonObject, zip);
                } else {
                    notifications.show({
                        autoClose: 7000,
                        title: "Upload failed",
                        message: `The JSON file failed to load correctly.`,
                        color: 'red',
                        className: 'my-notification-class',
                    })
                }
            })
            .catch(() => {
                console.log("Unable to extract " + JSON_FILE_NAME + " from zip file");
                notifications.show({
                    autoClose: 7000,
                    title: "Upload failed",
                    message: "Unable to extract " + JSON_FILE_NAME + " from zip file",
                    color: 'red',
                    className: 'my-notification-class',
                })
            })
        })
    }
}