import {
    fetchObservationResourceRemoveObservation,
    useObservationResourceGetObservation,
    useProposalResourceGetTargets
} from "../generated/proposalToolComponents.ts";
import {ActionIcon, Tooltip, Text, Space, Badge, Group, Table} from "@mantine/core";
import {IconCopy, IconTrash} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import {PerformanceParameters, TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import ObservationEditModal from "./edit.modal.tsx";
import {useParams} from "react-router-dom";
import {ObservationProps} from "./List.tsx";
import {useQueryClient} from "@tanstack/react-query";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";

export type ObservationId = {id: number}

export type TechnicalGoalsProps = {goal: TechnicalGoal, observationId: number}

export default function ObservationRow(observationId: ObservationId) {

    const queryClient = useQueryClient();

    const { selectedProposalCode} = useParams();

    const {data: observation, error: observationError, isLoading: observationLoading} =
        useObservationResourceGetObservation(
            {
                pathParams:
                {
                    proposalCode: Number(selectedProposalCode),
                    observationId: observationId.id,
                },
        });

    if (observationError) {
        return <pre>{getErrorMessage(observationError)}</pre>
    }

    let targetName = observationLoading ? '' : observation!.target!.sourceName!;

    const {data: target, error: targetError, isLoading: targetLoading} =
        useProposalResourceGetTargets(
            {
                pathParams: {proposalCode: Number(selectedProposalCode)},
                queryParams: {sourceName: "%" + targetName + "%"},
            },
        );

    if (targetError) {
        return <pre>{getErrorMessage(targetError)}</pre>
    }

    let targetId = targetLoading ? 0 : target!.at(0)!.dbid!;

    let observationProps : ObservationProps = {
        observation: observation!,
        id: observationId.id
    }

    function handleDelete() {
        fetchObservationResourceRemoveObservation({
            pathParams: {proposalCode: Number(selectedProposalCode), observationId: observationId.id}
        })
            .then(()=>queryClient.invalidateQueries())
            .catch(console.log);
    }

    const confirmDeletion = () => modals.openConfirmModal({
        title: 'Delete Observation?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    {(observation?.["@type"] === 'proposal:TargetObservation') ? 'Target' : 'Calibration'} Observation of '{observation?.target?.sourceName}'
                </Text>
                <Space h={"sm"}/>
                <Text c={"gray.6"} size={"sm"}>
                    Deletes the observation from the list only. Preserves everything except the timing windows.
                </Text>
            </>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm() {handleDelete()},
        onCancel: () => console.log('Cancel delete'),
    })

    const confirmCopy = () => modals.openConfirmModal({
        title: 'Copy Observation?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    {(observation?.["@type"] === 'proposal:TargetObservation') ? 'Target' : 'Calibration'} Observation of '{observation?.target?.sourceName}'
                </Text>
                <Space h={"sm"}/>
                <Text c={"gray.6"} size={"sm"}>
                    Creates a new observation with a deep copy of this observation's properties.
                    You should edit the copied observation for your needs.
                </Text>
            </>
        ),
        labels: {confirm: 'Copy', cancel: 'Do not copy'},
        confirmProps: {color: 'blue'},
        onConfirm: () => console.log('Confirm copy'),
        onCancel:() => console.log('Cancel copy'),
    })

    let performance : PerformanceParameters = observation?.technicalGoal?.performance!;

    let performanceFull = observationLoading ? false :
        performance.desiredAngularResolution?.value !== undefined &&
        performance.representativeSpectralPoint?.value !== undefined &&
        performance.desiredDynamicRange?.value !== undefined &&
        performance.desiredSensitivity?.value !== undefined &&
        performance.desiredLargestScale?.value !== undefined;

    let performanceEmpty = observationLoading ? true :
        performance.desiredAngularResolution?.value === undefined &&
        performance.representativeSpectralPoint?.value === undefined &&
        performance.desiredDynamicRange?.value === undefined &&
        performance.desiredSensitivity?.value === undefined &&
        performance.desiredLargestScale?.value === undefined;

    return (
        <>
            {observationLoading? ('Loading...') :
                (
                    <Table.Tr>
                        <Table.Td>
                            {observation?.target?.sourceName}
                        </Table.Td>
                        <Table.Td>
                            {observation?.["@type"]=== 'proposal:TargetObservation' ?
                                'target' : 'calibration'}
                        </Table.Td>
                        <Table.Td>
                            {observation?.field?.name}
                        </Table.Td>
                        <Table.Td>
                            {
                                performanceFull ?
                                    <Badge
                                        color={"green"}
                                        radius={0}
                                    >
                                        Set
                                    </Badge>:
                                    performanceEmpty ?
                                        <Badge
                                            color={"orange"}
                                            radius={0}
                                        >
                                            Not Set
                                        </Badge> :
                                        <Badge
                                            color={"yellow"}
                                            radius={0}
                                        >
                                            Partial
                                        </Badge>
                            }
                        </Table.Td>
                        <Table.Td>
                            {
                                observation?.technicalGoal?.spectrum?.length! > 0 ?
                                    <Badge
                                        color={"green"}
                                        radius={0}
                                    >
                                        {observation?.technicalGoal?.spectrum?.length!}
                                    </Badge>:
                                    <Badge
                                        color={"red"}
                                        radius={0}
                                    >
                                        None
                                    </Badge>
                            }
                        </Table.Td>
                        <Table.Td>
                            <Group>
                            {
                                observation?.constraints?.length! > 0 ?
                                    <Badge
                                        color={"green"}
                                        radius={0}
                                    >
                                        {observation?.constraints?.length!}
                                    </Badge> :
                                    <Badge
                                        color={"red"}
                                        radius={0}
                                    >
                                        None
                                    </Badge>
                            }
                            </Group>
                        </Table.Td>
                        <Table.Td>
                            <Group position={"right"}>
                                {
                                    observationLoading || targetLoading ? 'Loading...' :
                                    <ObservationEditModal
                                        observationProps={observationProps}
                                        targetId={targetId}
                                        newObservation={false}
                                    />
                                }
                                <Tooltip openDelay={1000} label={"copy"}>
                                    <ActionIcon color={"blue"} onClick={confirmCopy} variant={"subtle"}>
                                        <IconCopy size={"2rem"}/>
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip openDelay={1000}  label={"delete"}>
                                    <ActionIcon color={"red.7"} onClick={confirmDeletion} variant={"subtle"}>
                                        <IconTrash size={"2rem"}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                )
            }
        </>

    )
}