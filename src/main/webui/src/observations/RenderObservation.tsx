import {useObservationResourceGetObservation} from "../generated/proposalToolComponents.ts";
import {ActionIcon, Tooltip, Text, Space, Modal, Badge, Group} from "@mantine/core";
import {IconCopy, IconEyeEdit, IconTrash} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import {useDisclosure} from "@mantine/hooks";
import ViewEditTechnicalGoals from "./ViewEditTechnicalGoals.tsx";
import {PerformanceParameters, TechnicalGoal} from "../generated/proposalToolSchemas.ts";

export type ObservationProps = {proposalCode: number, dbid: number}

export type TechnicalGoalsProps = {goal: TechnicalGoal, ids: ObservationProps}

export default function RenderObservation(props: ObservationProps) {

    const {data: observation, error, isLoading} =
        useObservationResourceGetObservation(
            {pathParams:
                {
                    proposalCode: props.proposalCode,
                    observationId: props.dbid!,
                },
        });

    if (error) {
        return <pre>{getErrorMessage(error)}</pre>
    }


    const confirmDeletion = () => modals.openConfirmModal({
        title: 'Delete Observation?',
        children: (
            <>
                <Text color={"yellow"} size={"sm"}>
                    {(observation?.["@type"] === 'proposal:TargetObservation') ? 'Target' : 'Calibration'} Observation of '{observation?.target?.sourceName}'
                </Text>
                <Space h={"sm"}/>
                <Text color={"gray.6"} size={"sm"}>
                    Deletes the observation from the list only. Preserves everything except the timing windows.
                </Text>
            </>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm: () => console.log('Confirm delete'),
        onCancel: () => console.log('Cancel delete'),
    })

    const confirmCopy = () => modals.openConfirmModal({
        title: 'Copy Observation?',
        children: (
            <>
                <Text color={"yellow"} size={"sm"}>
                    {(observation?.["@type"] === 'proposal:TargetObservation') ? 'Target' : 'Calibration'} Observation of '{observation?.target?.sourceName}'
                </Text>
                <Space h={"sm"}/>
                <Text color={"gray.6"} size={"sm"}>
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

    const [editOpened, {close, open}] = useDisclosure();

    let performance : PerformanceParameters = observation?.technicalGoal?.performance!;

    let performanceFull =
        performance.desiredAngularResolution?.value !== undefined &&
        performance.representativeSpectralPoint?.value !== undefined &&
        performance.desiredDynamicRange?.value !== undefined &&
        performance.desiredSensitivity?.value !== undefined &&
        performance.desiredLargestScale?.value !== undefined;

    let performanceEmpty =
        performance.desiredAngularResolution?.value === undefined &&
        performance.representativeSpectralPoint?.value === undefined &&
        performance.desiredDynamicRange?.value === undefined &&
        performance.desiredSensitivity?.value === undefined &&
        performance.desiredLargestScale?.value === undefined;


    return (
        <>
            {isLoading? ('Loading...') :
                (
                    <tr>
                        <td>
                            {observation?.target?.sourceName}
                        </td>
                        <td>
                            {observation?.["@type"]=== 'proposal:TargetObservation' ?
                                'target' : 'calibration'}
                        </td>
                        <td>
                            {observation?.field?.name}
                        </td>
                        <td>
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
                        </td>
                        <td>
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
                        </td>
                        <td>
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
                        </td>
                        <td>
                            <Group position={"right"}>
                                <Tooltip openDelay={1000} label={"view/edit"}>
                                    <ActionIcon color={"green"} onClick={open}>
                                        <IconEyeEdit size={"2rem"}/>
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip openDelay={1000} label={"copy"}>
                                    <ActionIcon color={"blue"} onClick={confirmCopy}>
                                        <IconCopy size={"2rem"}/>
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip openDelay={1000}  label={"delete"}>
                                    <ActionIcon color={"red.7"} onClick={confirmDeletion}>
                                        <IconTrash size={"2rem"}/>
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                            <Modal
                                opened={editOpened}
                                onClose={close}
                                title={"View/edit technical goals"}
                                fullScreen
                            >
                                <ViewEditTechnicalGoals
                                    goal={observation?.technicalGoal!}
                                    ids={props}
                                />
                            </Modal>

                        </td>
                    </tr>
                )
            }
        </>

    )
}