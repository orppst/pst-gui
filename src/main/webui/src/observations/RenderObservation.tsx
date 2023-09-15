import {useObservationResourceGetObservation} from "../generated/proposalToolComponents.ts";
import {ActionIcon, Button, Tooltip, Text, Space} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";
import {modals} from "@mantine/modals";

type ObservationProps = {proposalCode: number, dbid: number}

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
                                observation?.technicalGoal ?
                                    <Button color={"green"}>view/edit</Button> :
                                    <Button color={"orange"}>add</Button>
                            }

                        </td>
                        <td>
                            {
                                observation?.constraints?.length! > 0 ?
                                    <Button color={"green"}>view/edit</Button> :
                                    <Button color={"orange"}>add</Button>
                            }
                        </td>
                        <td>
                            <Tooltip label={"delete observation"}>
                            <ActionIcon color={"red.7"} onClick={confirmDeletion}>
                                <IconTrash size={"2rem"}/>
                            </ActionIcon>
                            </Tooltip>
                        </td>
                    </tr>
                )
            }
        </>

    )
}