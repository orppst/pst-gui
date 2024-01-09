import * as JSZip from 'jszip';
import { notifications } from '@mantine/notifications';
import {
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


/**
 * uploads new targets with new database ids.
 *
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} promise when requests completed.
 * @constructor
 */
const HandleTargets = async (proposalData: ObservingProposal):
        Promise<void> => {
    // save all targets with new proposal id.
    const targetPromises: Promise<void | Target>[] = [];
    proposalData.targets?.forEach(
        (target: Target) => {
            const oldTargetId = target._id;
            target._id = undefined;
            targetPromises.push(
                fetchProposalResourceAddNewTarget({
                    pathParams: { proposalCode: Number(proposalData._id) },
                    body: target
                }).then((newTarget: Target) => {
                    target._id = newTarget._id;

                    // update any observations which had this target as its id,
                    // as it is pointing at the old one currently.
                    proposalData.observations?.forEach(
                        (observation: Observation) => {
                            if (observation.target?._id === oldTargetId) {
                                observation.target!._id = target._id;
                            }
                    })
                })
            )
        }
    )
    await Promise.all(targetPromises).then()
}

/**
 * uploads new technical goals with new database ids.
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} the promise when requests completed.
 * @constructor
 */
const HandleTechnicalGoals = async (proposalData: ObservingProposal): Promise<void> => {
    // process technical goals.
    const technicalGoalPromises: Promise<void | TechnicalGoal>[] = [];
    proposalData.technicalGoals?.forEach(
        (technicalGoal: TechnicalGoal) => {
            const oldTechnicalGoalId = technicalGoal._id;
            technicalGoal._id = undefined;
            technicalGoalPromises.push(
                fetchTechnicalGoalResourceAddTechnicalGoal({
                    pathParams: { proposalCode: Number(
                            proposalData._id) },
                    body: technicalGoal,
                }).then((newTechnicalGoal: TechnicalGoal) => {
                    technicalGoal._id = newTechnicalGoal._id

                    // update any observations which had this technical goal
                    // as its id, as it is pointing at the old one currently.
                    proposalData.observations?.forEach(
                        (observation: Observation) => {
                            if (observation.technicalGoal?._id === oldTechnicalGoalId) {
                                observation.technicalGoal!._id = technicalGoal._id;
                            }
                        })
                }));
        }
    )
    await Promise.all(technicalGoalPromises).then();
}

/**
 * uploads new observations with new database ids.
 * @param {ObservingProposal} proposalData the proposal data.
 * @return {Promise<void>} the promise when requests completed.
 * @constructor
 */
const HandleObservations = async (proposalData: ObservingProposal): Promise<void> => {
    const observationPromises: Promise<void | Observation>[] = [];
    proposalData.observations?.forEach(
        (observation: TargetObservation) => {
            observationPromises.push(
                fetchObservationResourceAddNewObservation({
                    pathParams:{proposalCode: Number(proposalData._id)},
                    body: observation
                }).then())})
    await Promise.all(observationPromises).then();
}

/**
 * converts the JSON read proposal data into new objects stored within the
 * database.
 * @param {ObservingProposal} proposalData the JSON proposal data.
 * @constructor
 */
const SaveAsNew = async (proposalData: ObservingProposal) => {
    await fetchProposalResourceCreateObservingProposal(
        { body: {} }).then(
        (data: ObservingProposal) => {
            proposalData._id = data._id;
        }
    )

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
    if (chosenFile) {
        JSZip.loadAsync(chosenFile).then(function (zip) {
            // check the json file exists.
            if (!Object.keys(zip.files).includes("json")) {
                notifications.show({
                    autoClose: 7000,
                    title: "Upload failed",
                    message: `There was no file called 'json' within the zip`,
                    color: 'red',
                    className: 'my-notification-class',
                })
            }

            // extract json data.
            zip.files['json'].async('text').then(function (fileData) {
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