import {Observation, ObservingProposal, Target} from "../../generated/proposalToolSchemas";
import {queryKeyProposals} from "../../queryKeyProposals";
import {notifyError, notifySuccess} from "../../commonPanel/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage";
import {ObservationFormValues} from "./types/ObservationFormInterface";
import {
    ObservationResourceReplaceTargetsError,
    ObservationResourceReplaceTargetsVariables,
    ObservationResourceReplaceTechnicalGoalError,
    ObservationResourceReplaceTechnicalGoalVariables
} from "../../generated/proposalToolComponents";
import {QueryClient, UseMutationResult} from "@tanstack/react-query";

/**
 * handles the processing of targets and technical goals.
 *
 * @param values: the updated values.
 * @param replaceTargets: the replace target mutation
 * @param selectedProposalCode: the proposal code
 * @param obsID: the observation id.
 * @param queryClient: the query client
 */
export function handleTargets(
        values: ObservationFormValues,
        replaceTargets: UseMutationResult<
            undefined,
            ObservationResourceReplaceTargetsError,
            ObservationResourceReplaceTargetsVariables,
            unknown>,
        selectedProposalCode:  string | undefined,
        obsID: number,
        queryClient: QueryClient,
): void {
    const body: Target[] = [];

    values.targetDBIds?.map((thisTarget) =>{
        body.push({
            "@type": "proposal:CelestialTarget",
            "_id": thisTarget
        })
    })

    replaceTargets.mutate({
        pathParams: {
            proposalCode: Number(selectedProposalCode),
            observationId: obsID
        },
        body: body
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeyProposals({
                    proposalId: Number(selectedProposalCode),
                    childName: "observations",
                    childId: obsID
                }),
            }).then(() =>
                notifySuccess(
                    "Targets updated",
                    "new targets saved")
            );
        },
        onError: (error) =>
            notifyError("Failed to update targets",
                getErrorMessage(error)),
    })
}

/**
 * handles the processing of targets and technical goals.
 *
 * @param values: the updated values.
 * @param selectedProposalCode: the proposal code
 * @param obsID: the observation id.
 * @param queryClient: the query client
 * @param replaceTechnicalGoal: the mutation for replacing technical goals.
 */
export function handleTechnicalGoals(
    values: ObservationFormValues,
    selectedProposalCode:  string | undefined,
    obsID: number,
    queryClient: QueryClient,
    replaceTechnicalGoal: UseMutationResult<
        undefined,
        ObservationResourceReplaceTechnicalGoalError,
        ObservationResourceReplaceTechnicalGoalVariables,
        unknown>
): void {
    replaceTechnicalGoal.mutate({
        pathParams: {
            proposalCode: Number(selectedProposalCode),
            observationId: obsID,
        },
        body: {
            "_id": values.techGoalId
        }
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeyProposals({
                    proposalId: Number(selectedProposalCode),
                    childName: "observations",
                    childId: obsID
                }),
            }).then(() =>
                notifySuccess(
                    "Technical Goal Updated",
                    "technical goal updates saved")
            );
        },
        onError: (error) =>
            notifyError("Failed to update technical goal",
                getErrorMessage(error)),
    })
}

/**
 * returns the target name
 * @param {Observation} observation the observation.
 * @param {ObservingProposal} proposalData the proposal data.
 */
export const getTargetName = (
        observation:  Observation,
        proposalData:  ObservingProposal): string => {
    //get all the target objects
    const targetObjs = [] as Target[];

    // safety check.
    if (proposalData !== undefined) {
        observation.target?.map((obsTarget) => {
            const targetObj = proposalData.targets!.find((target) =>
                target._id === obsTarget)!

            targetObjs.push(targetObj);
        });
    }

    // create a string of the first target names
    if (targetObjs.length != 0) {
        let targetNames = targetObjs[0].sourceName!;
        let targetIndex = 0;

        while (++targetIndex < 3
        && targetIndex < targetObjs.length) {
            targetNames += ", " + targetObjs[targetIndex].sourceName;
        }

        const remaining = targetObjs.length - targetIndex;

        if (remaining > 0) {
            targetNames += ", and " + remaining + " more";
        }
        return targetNames;
    }
    return "";
}