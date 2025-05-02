import JSZip from 'jszip';
import {Observation, ObservingProposal} from 'src/generated/proposalToolSchemas.ts';
import {
    JSON_FILE_NAME, OVERVIEW_PDF_FILENAME, MAX_SUPPORTING_DOCUMENT_SIZE,
    OPTICAL_FOLDER_NAME
} from 'src/constants.tsx';
import {
    fetchProposalResourceImportProposal,
    fetchSupportingDocumentResourceUploadSupportingDocument,
} from 'src/generated/proposalToolComponents.ts';
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {QueryClient} from "@tanstack/react-query";
import {
    fetchOpticalTelescopeResourceSaveTelescopeData,
    SavedTelescopeData,
} from "../../util/telescopeComms";

//Files to skip
const SKIP_FILES_PAR_DOCUMENT = new RegExp(
    "^Thumbs\\.db$|^__MACOS|^\\.DS_Store$|^" +
    OVERVIEW_PDF_FILENAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    "$|^" +
    OPTICAL_FOLDER_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    "(/.*)?$"
);

// skips all files par the ones within the optical folder.
const SKIP_FILES_PAR_OPTICAL = new RegExp(
    "^" +
    OPTICAL_FOLDER_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    "/.+$"
);


/**
 * Upload a document in a zip file to the given proposal.
 *
 * @param {number} proposalCode the proposal to upload against
 * @param {JSZip} zip zip file containing the supporting documents
 * @param {string} filename filename of the supporting document
 * @param {string} authToken authorization token from caller
 */
const uploadDocument =
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
 * returns the index for the given observation in a given proposal.
 *
 * @param zippedProposal: the zipped up proposal.
 * @param observationID: the observation id to find the index of.
 */
const findObservationIndex =
    (zippedProposal: ObservingProposal, observationID: number): number => {
        return zippedProposal.observations?.findIndex(
            (obs: Observation) => {
                return obs._id === observationID;
        }) ?? -1;
}

/**
 * uploads a given optical data for a given observation.
 *
 * @param uploadedProposal: the uploaded proposal with new observation ids.
 * @param zipedProposal: the zipped up proposal which we're uploading.
 * @param opticalFolder: the optical zip folder containing optical data.
 * @param filename: the observation file.
 */
const uploadOpticalObservation =
    (uploadedProposal: ObservingProposal, zipedProposal: ObservingProposal,
     opticalFolder: JSZip, filename: string) => {
        opticalFolder.files[filename].async('text')
            .then(function (fileData) {
                const opticalData: SavedTelescopeData = JSON.parse(fileData);

                // locate new obs id.
                const originalIndex = findObservationIndex(
                    zipedProposal,
                    Number(opticalData.primaryKey.observationID));
                const newObservationID =
                    uploadedProposal.observations![originalIndex]._id!;

                // update primary key.
                opticalData.primaryKey.observationID =
                    newObservationID.toString();
                opticalData.primaryKey.proposalID =
                    uploadedProposal._id!.toString();

                // need to convert to basic object for transmission.
                const opticalDataToSend: SavedTelescopeData = {
                    ...opticalData,
                    choices: opticalData.choices,
                };

                // send new data to backend for saving.
                fetchOpticalTelescopeResourceSaveTelescopeData(opticalDataToSend)
                    .catch(
                    (error) => {
                        console.error("Error saving optical data:", error);
                        throw error;
                    }
                );
            });
}

/**
 * sends the proposal json to API, then uploads all other documents in the zip.
 *
 * @param {ObservingProposal} observingProposal the observing proposal to be imported
 * @param {JSZip} zip zip file containing any supporting documents
 * @param {string} authToken authorization token from caller
 * @param {QueryClient} queryClient the query client from caller
 */
function sendToImportAPI(
    observingProposal: ObservingProposal,
    zip: JSZip,
    authToken: string,
    queryClient: QueryClient
) {
    // send proposal to import process.
    fetchProposalResourceImportProposal({
        body: observingProposal,
        headers: {authorization: `Bearer ${authToken}`}
    })
        .then((uploadedProposal: ObservingProposal) => {
            // handles documents to upload to new proposal version.
            Object.keys(zip.files).forEach((filename: string) => {
                if (filename !== JSON_FILE_NAME &&
                        !SKIP_FILES_PAR_DOCUMENT.test(filename)) {
                    uploadDocument(
                        Number(uploadedProposal._id), zip, filename, authToken);
                }
            })

            //handles optical components for the new proposal.
            // expect the opticals data if it exists.
            const opticalFolder: JSZip | null = zip.folder(OPTICAL_FOLDER_NAME);
            if (opticalFolder !== null) {
                Object.keys(opticalFolder.files).forEach((filename) => {
                    if(SKIP_FILES_PAR_OPTICAL.test(filename)) {
                        uploadOpticalObservation(
                            uploadedProposal, observingProposal, opticalFolder,
                            filename);
                    }
                })
            }
        })
        .then(() => {
            queryClient.invalidateQueries({
                queryKey: ['pst', 'api', 'proposals']
            }).then(() => {
                notifySuccess(
                    "Upload successful", "The proposal has been uploaded")
            })
        })
        .catch((error) => {
            notifyError("Upload failed", getErrorMessage(error));
        })
}

/**
 * processes the incoming zip file.
 *
 * @param chosenFileRaw: the zip file or null.
 * @param authToken: the authentication token.
 * @param queryClient: the query client.
 */
export const handleZip = (
    chosenFileRaw: File | null, authToken: string, queryClient: QueryClient):
    void => {

    // check for no file.
    if (chosenFileRaw === null) {
        notifyError("Upload failed", "There was no file to upload")
    }

    const chosenFile: File = chosenFileRaw!;

    // all simple checks done. Time to verify the internals of the zip.
    JSZip.loadAsync(chosenFile).then((zip: JSZip) => {
        // check the json file exists.
        if (!Object.keys(zip.files).includes(JSON_FILE_NAME)) {
            notifyError("Upload failed",
                "There was no file called '"+JSON_FILE_NAME+"' within the zip")
        }

        // extract json data to import proposal definition.
        zip.files[JSON_FILE_NAME].async('text')
            .then(function (fileData) {
                const jsonObject: ObservingProposal = JSON.parse(fileData)
                // ensure not undefined
                if (jsonObject) {
                    sendToImportAPI(jsonObject, zip, authToken, queryClient);
                } else {
                    notifyError(
                        "Upload failed",
                        "The JSON file failed to load correctly")
                }
            })
            .catch(() => {
                console.log(
                    "Unable to extract " + JSON_FILE_NAME + " from zip file");
                notifyError("Upload failed",
                    "Unable to extract " + JSON_FILE_NAME + " from zip file");
            })
    })
}

