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
    fetchOpticalTelescopeResourceGetTelescopeData,
    fetchOpticalTelescopeResourceSaveTelescopeData, Field, Instrument,
    SavedTelescopeData, Telescope, Type,
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
                        body: formData,
                        pathParams: {proposalCode: proposalCode},
                        headers: {
                            authorization: `Bearer ${authToken}`,
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
 * @param {ObservingProposal} zippedProposal the zipped up proposal.
 * @param {number} observationID the observation id to find the index of.
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
 * @param {ObservingProposal} uploadedProposal the uploaded proposal with new
 * observation ids.
 * @param {ObservingProposal} zipedProposal the zipped up proposal which we're uploading.
 * @param {SavedTelescopeData} opticalData the optical data that's valid.
 */
const uploadOpticalObservation =
        (uploadedProposal: ObservingProposal, zipedProposal: ObservingProposal,
         opticalData: SavedTelescopeData) => {

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
}

/**
 *
 * @param {SavedTelescopeData} opticalState the possible valid optical state.
 * @param {Map<string, Telescope>} polarisTelescopes the set of polaris data.
 */
const isOpticalValid = (
        opticalState: SavedTelescopeData,
        polarisTelescopes: Map<string, Telescope>) => {
    if (!polarisTelescopes.has(opticalState.telescopeName)) {
        notifyError(
            "Missing Telescope",
            `Importing observation ${opticalState.primaryKey.observationID} 
            has the telescope ${opticalState.telescopeName} which does not 
            exist in this polaris instance. So this observation data will not 
            be imported.`);
        return false;
    }

    // process instrument.
    const polarisTelescope: Telescope =
        polarisTelescopes.get(opticalState.telescopeName)!;
    const polarisInstruments = new Map<string, Instrument>(
        Object.entries(polarisTelescope.instruments))
    if(!polarisInstruments.has(opticalState.instrumentName)) {
        notifyError(
            "Missing instrument",
            `Importing observation ${opticalState.primaryKey.observationID} 
            has the instrument ${opticalState.instrumentName} which does not 
            exist in this polaris instance. So this observation data will not 
            be imported.`);
        return false;
    }

    // verify choices are matching.
    const polarisChoices: Map<string, Field> = new Map<string, Field>(
        Object.entries(polarisInstruments.get(
            opticalState.instrumentName)!.elements));
    const importChoices: Map<string, string> =
        new Map(Object.entries(opticalState.choices ?? {}));
    for (const [opticalChoiceName, opticalChoiceValue] of importChoices) {
        if (!polarisChoices.has(opticalChoiceName)) {
            notifyError(
                "Extra choice",
                `Importing observation ${opticalState.primaryKey.observationID}
                has an unexpected choice '${opticalChoiceName}' for
                telescope ${opticalState.telescopeName} and instrument 
                ${opticalState.instrumentName}. This observation data will 
                not be imported.`);
            return false;
        }

        // verify the value is valid.
        const polarisField: Field = polarisChoices.get(opticalChoiceName)!;
        switch(polarisField.type) {
            case Type.BOOLEAN:
                if (opticalChoiceValue !== "true" &&
                        opticalChoiceValue !== "false") {
                    notifyError(
                        "Invalid boolean choice",
                        `Importing observation 
                        ${opticalState.primaryKey.observationID}
                        has an unexpected choice value for 
                        '${opticalChoiceName}' for telescope 
                        ${opticalState.telescopeName} and instrument 
                        ${opticalState.instrumentName}. This observation data 
                        will not be imported.`);
                        return false;
                }
                break;
            case Type.LIST:
                if(!polarisField.values.includes(opticalChoiceValue)) {
                    notifyError(
                        "Invalid list choice",
                        `Importing observation 
                        ${opticalState.primaryKey.observationID}
                        has an unexpected choice value for 
                        '${opticalChoiceName}' for telescope
                        ${opticalState.telescopeName} and instrument 
                        ${opticalState.instrumentName}. This observation data 
                        will not be imported.`);
                        return false;
                }
                break;
            case Type.TEXT:
                break;
            default:
                notifyError(
                    "Missing data type",
                    `Importing observation 
                    ${opticalState.primaryKey.observationID}
                    has an unexpected choice type for '${opticalChoiceName}' for
                    telescope ${opticalState.telescopeName} and instrument 
                    ${opticalState.instrumentName}. This observation data will 
                    not be imported.`);
                return false;
        }
    }

    // verify that each polaris choice exists in the imported one.
    for (const polarisChoiceName of polarisChoices.keys()) {
        if (!importChoices.has(polarisChoiceName)) {
            notifyError(
                "missing choice",
                `Importing observation ${opticalState.primaryKey.observationID}
                is missing the expected choice '${polarisChoiceName}' for
                telescope ${opticalState.telescopeName} and instrument
                ${opticalState.instrumentName}. This observation data will 
                not be imported.`,
            );
            return false;
        }
    }

    // if all these checks have passed. then the imported choices are
    // valid for this current version of polaris.
    return true;
}

/**
 * process an optical folder for valid states given the current polaris
 * settings.
 *
 * @param {JSZip} zip the zip folder.
 * @param {ObservingProposal} proposal the proposal from the zip.
 */
const processOpticalErrors = async (zip: JSZip, proposal: ObservingProposal):
        Promise<SavedTelescopeData[]> => {
    // extract optical states.
    const possibleValidStatesPromise: Promise<SavedTelescopeData>[] = [];
    const opticalFolder: JSZip | null = zip.folder(OPTICAL_FOLDER_NAME);
    if (opticalFolder !== null) {
        Object.keys(opticalFolder.files).forEach((filename) => {
            if (SKIP_FILES_PAR_OPTICAL.test(filename)) {
                const filePromise =
                    opticalFolder.files[filename].async('text').then(
                        function (fileData: string) {
                            return JSON.parse(fileData) as SavedTelescopeData;
                        }
                    );
                possibleValidStatesPromise.push(filePromise);
            }
        })
    }

    // Wait for all asynchronous file reads to complete
    const possibleValidStates = await Promise.all(possibleValidStatesPromise);

    // if no optical, return empty array, as no errors or valid.
    if (possibleValidStates.length === 0) {
        return [];
    }

    // call the optical telescope data to validate each possible,
    const validStates: SavedTelescopeData[] = [];
    await fetchOpticalTelescopeResourceGetTelescopeData().then(
        (polarisTelescopesRaw: Map<string, Telescope>) => {
            const polarisTelescopes = new Map<string, Telescope>(
                Object.entries(polarisTelescopesRaw));
            possibleValidStates.forEach((opticalState: SavedTelescopeData) => {
                if(isOpticalValid(opticalState, polarisTelescopes)) {
                    validStates.push(opticalState);
                } else {
                    //kill that obs as its not valid anymore and as optical
                    // we cant assume they just want a radio instead.
                    const obs = proposal.observations?.find(
                        obs => obs._id!.toString() ===
                            opticalState.primaryKey.observationID);
                    proposal.observations?.splice(
                        proposal.observations?.indexOf(obs!), 1);
                }
            })
        }
    )

    return validStates;
}

/**
 * processes documents.
 *
 * @param {ObservingProposal} uploadedProposal the observing proposal when uploaded.
 * @param {JSZip} zip zip file containing any supporting documents
 * @param {string} authToken authorization token from caller
 */
const processDocument = (zip: JSZip, authToken: string,
                         uploadedProposal: ObservingProposal) => {
    Object.keys(zip.files).forEach((filename: string) => {
        if (filename !== JSON_FILE_NAME &&
            !SKIP_FILES_PAR_DOCUMENT.test(filename)) {
            uploadDocument(
                Number(uploadedProposal._id), zip, filename, authToken);
        }
    })
}

/**
 *
 * @param {JSZip} zip zip file containing any supporting documents
 * @param {SavedTelescopeData[]} opticalValidStates optical data which is valid.
 * @param {ObservingProposal} observingProposal the original proposal.
 * @param {ObservingProposal} uploadedProposal the uploaded one.
 */
const processOptical = (zip: JSZip, opticalValidStates: SavedTelescopeData[],
                        observingProposal: ObservingProposal,
                        uploadedProposal: ObservingProposal) => {
    const opticalFolder: JSZip | null = zip.folder(OPTICAL_FOLDER_NAME);
    if (opticalFolder !== null) {
        opticalValidStates.forEach(
            (opticalData:  SavedTelescopeData) => {
                uploadOpticalObservation(
                    uploadedProposal, observingProposal,
                    opticalData);
            })
    }
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
    // process optical for issues.
    processOpticalErrors(zip, observingProposal).then(
        (opticalValidStates: SavedTelescopeData[]) => {
            // send proposal to import process.
            fetchProposalResourceImportProposal({
                body: observingProposal,
                headers: {authorization: `Bearer ${authToken}`}
            }).then(
                (uploadedProposal: ObservingProposal) => {
                    // handles documents to upload to new proposal version.
                    processDocument(zip, authToken, uploadedProposal);

                    //handles optical components for the new proposal.
                    // expect the optical data if it exists.
                    processOptical(
                        zip, opticalValidStates, observingProposal,
                        uploadedProposal);

                    // force ui update.
                    queryClient.invalidateQueries(
                        {queryKey: ['pst', 'api', 'proposals']})
                    .then(
                        () => {
                            notifySuccess(
                                "Upload successful",
                                "The proposal has been uploaded");
                        }
                    )
                })
                .catch((error) => {
                    notifyError("Upload failed", getErrorMessage(error));
                })
        });
}

/**
 * processes the incoming zip file.
 *
 * @param {File | null} chosenFileRaw the zip file or null.
 * @param {string} authToken the authentication token.
 * @param {QueryClient} queryClient the query client.
 */
export const handleZip = (
        chosenFileRaw: File | null, authToken: string,
        queryClient: QueryClient): void => {
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

