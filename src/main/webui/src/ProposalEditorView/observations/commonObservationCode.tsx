import {Target} from "../../generated/proposalToolSchemas";
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