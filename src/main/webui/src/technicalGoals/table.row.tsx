import {TechnicalGoalId} from "./Goals.tsx";
import {
    useProposalResourceGetTechnicalGoal
} from "../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {ActionIcon, Badge, Group, Space, Table, Text, Tooltip} from "@mantine/core";
import {IconCopy, IconTrash} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import TechnicalGoalEditModal from "./edit.modal.tsx";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import {notSpecified} from "./parent.form.tsx";

export default function TechnicalGoalRow(technicalGoalId: TechnicalGoalId) {

    const { selectedProposalCode} = useParams();

    const {data: goal, error: goalError, isLoading: goalLoading} =
        useProposalResourceGetTechnicalGoal(
            {
                pathParams:
                    {
                        proposalCode: Number(selectedProposalCode),
                        technicalGoalId: technicalGoalId.id
                    },
            }

        );

    if (goalError) {
        return <pre>{getErrorMessage(goalError)}</pre>
    }

    const handleDelete = () => {
        console.log("Deleting technical goal");
    }

    const confirmDelete = () => modals.openConfirmModal({
        title: 'Delete Technical Goal?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    Technical goal #{goal?._id}
                </Text>
            </>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm: handleDelete,
        onCancel: () => console.log('Cancel delete'),
    })

    const handleClone = () => {
        console.log("Cloning Technical Goal")
    }

    const confirmClone = () => modals.openConfirmModal({
        title: 'Clone Technical Goal?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    Technical goal #{goal?._id}
                </Text>
                <Space h={"xs"}/>
                <Text c={"gray.6"} size={"sm"}>
                    Creates a new technical goal with a clone of this technical goal's properties.
                    You should edit the cloned technical goal for your needs.
                </Text>
            </>
        ),
        labels: {confirm: 'Clone', cancel: 'Do not clone'},
        confirmProps: {color: 'blue'},
        onConfirm: handleClone,
        onCancel:() => console.log('Cancel copy'),
    })

    return (
        <>
            {goalLoading ? ('Loading...') :
                (
                    <Table.Tr>
                        <Table.Td>
                            {goal?._id}
                        </Table.Td>
                        <Table.Td>
                            {goal?.performance?.desiredAngularResolution?.value ?
                                goal?.performance?.desiredAngularResolution?.value :
                                <Text c={"yellow"}>{notSpecified}</Text>
                            }
                        </Table.Td>
                        <Table.Td>
                            {goal?.performance?.desiredLargestScale?.value ?
                                goal?.performance?.desiredLargestScale?.value :
                                <Text c={"yellow"}>{notSpecified}</Text>
                            }
                        </Table.Td>
                        <Table.Td>
                            {goal?.performance?.desiredSensitivity?.value ?
                                goal?.performance?.desiredSensitivity?.value :
                                <Text c={"yellow"}>{notSpecified}</Text>
                            }
                        </Table.Td>
                        <Table.Td>
                            {goal?.performance?.desiredDynamicRange?.value ?
                                goal?.performance?.desiredDynamicRange?.value :
                                <Text c={"yellow"}>{notSpecified}</Text>
                            }
                        </Table.Td>
                        <Table.Td>
                            {goal?.performance?.representativeSpectralPoint?.value ?
                                goal?.performance?.representativeSpectralPoint?.value :
                                <Text c={"yellow"}>{notSpecified}</Text>
                            }
                        </Table.Td>
                        <Table.Td>
                            {
                                goal?.spectrum?.length! > 0 ?
                                    <Badge
                                        color={"green"}
                                        radius={0}
                                    >
                                        {goal?.spectrum?.length!}
                                    </Badge>:
                                    <Badge
                                        c={"red"}
                                        radius={0}
                                    >
                                        None
                                    </Badge>
                            }
                        </Table.Td>
                        <Table.Td>
                            <Group position={"right"}>
                                {
                                    goalLoading ? 'Loading...' :
                                        <TechnicalGoalEditModal {...goal} />
                                }
                                <Tooltip openDelay={1000} label={"clone"}>
                                    <ActionIcon color={"blue"} onClick={confirmClone} variant={"subtle"}>
                                        <IconCopy size={"2rem"}/>
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip openDelay={1000}  label={"delete"}>
                                    <ActionIcon color={"red.7"} onClick={confirmDelete} variant={"subtle"}>
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