import {
    fetchObservationResourceRemoveObservation,
    useObservationResourceGetObservation
} from "../generated/proposalToolComponents.ts";
import {Text, Space, Badge, Group, Table} from "@mantine/core";
import {modals} from "@mantine/modals";
import {PerformanceParameters, TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import ObservationEditModal from "./edit.modal.tsx";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import CloneButton from "../commonButtons/clone.tsx";
import DeleteButton from "../commonButtons/delete.tsx";

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

    const handleDelete = () => {
        fetchObservationResourceRemoveObservation({
            pathParams: {proposalCode: Number(selectedProposalCode), observationId: observationId.id}
        })
            .then(() => queryClient.invalidateQueries())
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

    const handleClone = () => {
        alert("Clone function not yet implemented");
    }

    const confirmClone = () => modals.openConfirmModal({
        title: 'Clone Observation?',
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
        labels: {confirm: 'Clone', cancel: 'Do not clone'},
        confirmProps: {color: 'blue'},
        onConfirm() {handleClone()},
        onCancel:() => console.log('Cancel clone'),
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


    /*
    On startup this code triggers the following in warning (in Chrome at least):
        Warning: validateDOMNesting(...): Text nodes cannot appear as a child of <tbody>
    I have yet to track down the cause. I suspect either one-of the 'Loading...' texts or possibly the observation
    type text. Note the warning disappears after the initial render so the 'Loading...' texts are prime suspects.
     */

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
                                    observationLoading ? 'Loading...' :
                                    <ObservationEditModal
                                        observation={observation}
                                        observationId={observationId.id}
                                        newObservation={false}
                                    />
                                }
                                <CloneButton toolTipLabel={"clone"} onClick={confirmClone} />
                                <DeleteButton toolTipLabel={"delete"} onClick={confirmDeletion} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                )
            }
        </>

    )
}