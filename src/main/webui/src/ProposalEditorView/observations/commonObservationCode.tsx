import {Target} from "../../generated/proposalToolSchemas";
import {queryKeyProposals} from "../../queryKeyProposals";
import {notifyError, notifySuccess} from "../../commonPanel/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage";
import {UseFormReturnType} from "@mantine/form";
import {ObservationFormValues} from "./types/ObservationFormInterface";
import {
    ObservationResourceReplaceTargetsError,
    ObservationResourceReplaceTargetsVariables,
    ObservationResourceReplaceTechnicalGoalError,
    ObservationResourceReplaceTechnicalGoalVariables
} from "../../generated/proposalToolComponents";
import {QueryClient, UseMutationResult} from "@tanstack/react-query";

export function handleTargetsAndTechnicalGoals(
        form: UseFormReturnType<ObservationFormValues>,
        values: ObservationFormValues,
        replaceTargets: UseMutationResult<
            undefined,
            ObservationResourceReplaceTargetsError,
            ObservationResourceReplaceTargetsVariables,
            unknown>,
        selectedProposalCode:  string | undefined,
        obsID: number,
        queryClient: QueryClient,
        replaceTechnicalGoal: UseMutationResult<
            undefined,
            ObservationResourceReplaceTechnicalGoalError,
            ObservationResourceReplaceTechnicalGoalVariables,
            unknown>
): void {
    if (form.isDirty('targetDBIds')) {
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
                        childId: form.getValues().observationId!
                    }),
                }).then(() =>
                    notifySuccess(
                        "Targets updated", "new targets saved")
                );
            },
            onError: (error) =>
                notifyError("Failed to update targets",
                    getErrorMessage(error)),
        })
    }

    if (form.isDirty('techGoalId')) {
        replaceTechnicalGoal.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                observationId: obsID,
            },
            body: {
                "_id": form.values.techGoalId
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: queryKeyProposals({
                        proposalId: Number(selectedProposalCode),
                        childName: "observations",
                        childId: form.getValues().observationId!
                    }),
                }).then(() =>
                    notifySuccess("Technical Goal Updated",
                        "technical goal updates saved")
                );
            },
            onError: (error) =>
                notifyError("Failed to update technical goal",
                    getErrorMessage(error)),
        })
    }
}