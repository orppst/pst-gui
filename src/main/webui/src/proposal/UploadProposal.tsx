import * as JSZip from 'jszip';
import { notifications } from '@mantine/notifications';
import {
    CalibrationObservation,
    Observation,
    ObservingProposal,
    Target, TargetObservation,
    TechnicalGoal
} from '../generated/proposalToolSchemas.ts';
import {
    fetchObservationResourceAddNewObservation,
    fetchProposalResourceAddNewTarget,
    fetchProposalResourceCreateObservingProposal,
    fetchTechnicalGoalResourceAddTechnicalGoal
} from '../generated/proposalToolComponents.ts';
import { JSON_FILE_NAME } from '../constants.tsx';

/**
 * uploads new targets with new database ids.
 *
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} promise when requests completed.
 */
const HandleTargets = async (proposalData: ObservingProposal):
        Promise<void> => {
    // save all targets with new proposal id.
    const targetPromises: Promise<void>[] | undefined =
            proposalData.targets?.map(
            async (target: Target) => {
                const oldTargetId = target._id;
                target._id = undefined;
                await fetchProposalResourceAddNewTarget({
                    pathParams: { proposalCode: Number(proposalData._id) },
                    body: target
                }).then((newTarget: Target) => {
                    target._id = newTarget._id;

                    // update any observations which had this target as its id,
                    // as it is pointing at the old one currently.
                    proposalData.observations?.forEach(
                        (observation: Observation) => {
                            if (observation.target === oldTargetId) {
                                // @ts-ignore
                                observation.target = target._id;
                            }
                    })
                }).catch((reason: any) => {
                    notifications.show({
                        autoClose: 7000,
                        title: "Upload failed",
                        message: `The saving of the target failed for reason:${reason.message}.`,
                        color: 'red',
                        className: 'my-notification-class',
                    })})});
    await Promise.all(targetPromises!).then()
}

/**
 * uploads new technical goals with new database ids.
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} the promise when requests completed.
 */
const HandleTechnicalGoals = async (proposalData: ObservingProposal):
        Promise<void> => {
    // process technical goals.
    const technicalGoalPromises: Promise<void>[] | undefined =
        proposalData.technicalGoals?.map(
            async (technicalGoal: TechnicalGoal) => {
                const oldTechnicalGoalId = technicalGoal._id;
                technicalGoal._id = undefined;
                await fetchTechnicalGoalResourceAddTechnicalGoal({
                        pathParams: { proposalCode: Number(
                                proposalData._id) },
                        body: technicalGoal,
                    }).then((newTechnicalGoal: TechnicalGoal) => {
                        technicalGoal._id = newTechnicalGoal._id

                        // update any observations which had this technical goal
                        // as its id, as it is pointing at the old one currently.
                        proposalData.observations?.forEach(
                            (observation: Observation) => {
                                if (observation.technicalGoal ===
                                        oldTechnicalGoalId) {
                                    // @ts-ignore
                                    observation.technicalGoal =
                                        technicalGoal._id;
                                }
                            })
                    }).catch((reason: any) => {
                        notifications.show({
                            autoClose: 7000,
                            title: "Upload failed",
                            message: `The saving of the technical goal failed` +
                                     `for reason:${reason.message}.`,
                            color: 'red',
                            className: 'my-notification-class',
                        })})});
    await Promise.all(technicalGoalPromises!).then();
}

/**
 * uploads new observations with new database ids.
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} the promise when requests completed.
 */
const HandleObservations = async (proposalData: ObservingProposal):
        Promise<void> => {
    const observationPromises: Promise<void | Observation>[] = [];
    proposalData.observations?.forEach(
        (observation: TargetObservation) => {
            let body = {
                target: {
                    "@type": "proposal:CelestialTarget",
                    "_id": observation.target?._id
                },
                technicalGoal: {
                    "_id": observation.technicalGoal?._id
                },
                field: {
                    "@type": "proposal:TargetField",
                    "_id": observation.field?._id
                },
                constraints: []
            };

            if (observation['@type'] == 'Calibration') {
                let calibrationObservation =
                    observation as CalibrationObservation;
                body = {
                    ...body, ...{
                        "@type": "proposal:CalibrationObservation",
                        intent: calibrationObservation.intent
                    }
                }
            } else {
                body = {
                    ...body, ...{
                        "@type": "proposal:TargetObservation",
                    }
                }
            }

            observationPromises.push(
                fetchObservationResourceAddNewObservation({
                    pathParams:{proposalCode: Number(proposalData._id)},
                    body: body
                }).then().catch((reason: any) => {
                    notifications.show({
                        autoClose: 7000,
                        title: "Upload failed",
                        message: `The saving of the observation failed for reason:${reason.message}.`,
                        color: 'red',
                        className: 'my-notification-class',
                    })}))})
    await Promise.all(observationPromises).then();
}

/**
 * uploads new observations with new database ids.
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} the promise when requests completed.
 */
const HandleProposal = async (proposalData: ObservingProposal):
        Promise<void> => {
    await fetchProposalResourceCreateObservingProposal(
        { body: {
            title: proposalData.title,
            summary: proposalData.summary,
            kind: proposalData.kind,
            investigators: []
            } }).then(
        (data: ObservingProposal) => {
            proposalData._id = data._id;
        }
    ).catch((reason: any) => {
        notifications.show({
            autoClose: 7000,
            title: "Upload failed",
            message: `The saving of the proposal failed for reason:${reason.message}.`,
            color: 'red',
            className: 'my-notification-class',
        })
    })
}

/**
 * converts the JSON read proposal data into new objects stored within the
 * database.
 * @param {ObservingProposal} proposalData the JSON proposal data.
 * @constructor
 */
const SaveAsNew = async (proposalData: ObservingProposal) => {
    await HandleProposal(proposalData);
    await HandleTargets(proposalData);
    await HandleTechnicalGoals(proposalData);
    await HandleObservations(proposalData);

}



/**
 * handles looking up a file and uploading it to the system.
 * @param {File} chosenFile the zip file containing a json representation
 * of the proposal.
 */
export const handleUploadZip = async (chosenFile: File | null) => {
    if (chosenFile === null) {
        notifications.show({
            autoClose: 7000,
            title: "Upload failed",
            message: `There was no file to upload`,
            color: 'red',
            className: 'my-notification-class',
        })
    } else {
        JSZip.loadAsync(chosenFile).then(function (zip) {
            // check the json file exists.
            if (!Object.keys(zip.files).includes(JSON_FILE_NAME)) {
                notifications.show({
                    autoClose: 7000,
                    title: "Upload failed",
                    message: `There was no file called 'json' within the zip`,
                    color: 'red',
                    className: 'my-notification-class',
                })
            }

            // extract json data.
            zip.files[JSON_FILE_NAME].async('text').then(function (fileData) {
                const jsonObject: ObservingProposal = JSON.parse(fileData)

                // ensure not undefined
                if (jsonObject) {

                    // log the output, for debugging purposes.
                    console.debug(jsonObject)

                    // save as new project with new ids.
                    SaveAsNew(jsonObject);
                }
            })

        })
    }
}