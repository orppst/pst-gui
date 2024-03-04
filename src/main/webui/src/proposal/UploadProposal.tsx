import * as JSZip from 'jszip';
import { notifications } from '@mantine/notifications';
import { ObservingProposal } from '../generated/proposalToolSchemas.ts';
import { JSON_FILE_NAME, MAX_ZIP_SIZE } from '../constants.tsx';
import { modals } from '@mantine/modals';
import {
    fetchProposalResourceImportProposal,
    fetchProposalResourceUploadProposal,
    fetchSupportingDocumentResourceUploadSupportingDocument,
} from '../generated/proposalToolComponents.ts';

/**
 * asks the user to confirm if it should be a submitted or new
 * unsubmitted proposal.
 * @param {File} chosenFile the zip file containing the proposal data.
 */
export const GenerateConfirmation = (chosenFile: File): void => {
    modals.openConfirmModal({
        title: 'Please confirm proposal state',
        children: (
            <div>
                The proposal your trying to upload is a submitted proposal.
                Do you wish to keep it as a submitted proposal?
            </div>
        ),
        labels: { confirm: 'Yes', cancel: 'No' },
        onCancel: () => SendToServer(chosenFile, false),
        onConfirm: () => SendToServer(chosenFile, true),
    });
}

/**
 * sends the zip file to the server for uploading.
 * @param {File} chosenFile the zip file containing the proposal data.
 * @param {boolean} changeSubmission flag for the server to change the
 * submission field.
 */
export const SendToServer = (
        chosenFile: File, changeSubmission: boolean): void => {
    const formData = new FormData();
    formData.append("document", chosenFile);
    formData.append("changeSubmissionFlag", String(changeSubmission));

    fetchProposalResourceUploadProposal({
        // @ts-ignore
        body: formData,
        // @ts-ignore
        headers: {"Content-Type": "multipart/form-data"}
    }).then(() => {
        notifications.show({
            autoClose: 5000,
            title: "Upload successful",
            message: 'The supporting proposal has been uploaded',
            color: 'green',
            className: 'my-notification-class',
        });
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

const UploadADocument = (proposalCode: number, zip: JSZip, filename: string) => {
    const formData = new FormData();
    zip.file(filename).async("blob")
        .then((document) => {
            formData.append("document", document);
            formData.append("title", filename);
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
        });
};

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
 * handles looking up a file and uploading it to the system.
 * @param {File} chosenFile the zip file containing a json representation
 * of the proposal.
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

    // check that the zip is not some silly size.
    if (chosenFile !== null && chosenFile.size >= MAX_ZIP_SIZE) {
        notifications.show({
            autoClose: 7000,
            title: "Upload failed",
            message: `The zip was too large. Maximum size of zip is 20 MB`,
            color: 'red',
            className: 'my-notification-class',
        })
        return;
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
                    //jsonObject.investigators = [{}];
                    //jsonObject.supportingDocuments = [{}];
                    SendToImportAPI(jsonObject, zip);
                    /*
                    if (jsonObject.submitted) {
                        GenerateConfirmation(chosenFile)
                    } else {
                        SendToServer(chosenFile, false)
                    }*/

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
            .catch(() => console.log("Unable to extract " + JSON_FILE_NAME + " from zip file"))
        })
    }
}