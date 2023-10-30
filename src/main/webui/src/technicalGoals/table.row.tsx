import {TechnicalGoalId} from "./Goals.tsx";
import {
    fetchProposalResourceAddNewTechnicalGoal,
    fetchProposalResourceRemoveTechnicalGoal,
    useProposalResourceGetTechnicalGoal
} from '../generated/proposalToolComponents.ts';
import {useParams} from "react-router-dom";
import {Badge, Group, Space, Table, Text} from "@mantine/core";
import {modals} from "@mantine/modals";
import TechnicalGoalEditModal from "./edit.modal.tsx";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import {notSpecified} from "./edit.group.tsx";
import CloneButton from "../commonButtons/clone.tsx";
import DeleteButton from "../commonButtons/delete.tsx";
import {useQueryClient} from "@tanstack/react-query";
import { TechnicalGoal } from '../generated/proposalToolSchemas.ts';

export default function TechnicalGoalRow(technicalGoalId: TechnicalGoalId) {

    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

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

    /**
     * processes the actual deletion of a technical goal from the database.
     */
    const handleDelete = () => {
        fetchProposalResourceRemoveTechnicalGoal( {
            pathParams: {proposalCode: Number(selectedProposalCode), techGoalId: technicalGoalId.id}
        })
            .then(()=>queryClient.invalidateQueries())
            .catch(console.error);
    }

    /**
     * create a safety check with the user to ensure they want to delete a given technical goal.
     */
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

    /**
     * processes the actual cloning of a technical goal.
     */
    const handleClone = () => {
        console.log("Cloning Technical Goal")

        // create a new technicalGoal, which does not have its id set, but contains the spectral and performance
        // of the selected goal.
        let clonedGoal: TechnicalGoal = {
            performance: goal?.performance,
            spectrum: goal?.spectrum
        }

        // save the new clonedGoal to the database.
        fetchProposalResourceAddNewTechnicalGoal( {
            pathParams: {proposalCode: Number(selectedProposalCode)},
            body: clonedGoal
        })
            .then(()=>
                queryClient.invalidateQueries().then(
                    () => console.log("Cloning Technical Goal success."))
            )
            .catch(console.error);
    }

    /**
     * create a safety check with the user to ensure they want to clone a given technical goal.
     */
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

    let hasAngularResolution = !!goal?.performance?.desiredAngularResolution?.value;
    let hasLargestScale = !!goal?.performance?.desiredLargestScale?.value;
    let hasSensitivity= !!goal?.performance?.desiredSensitivity?.value;
    let hasDynamicRange= !!goal?.performance?.desiredDynamicRange?.value;
    let hasSpectralPoint = !!goal?.performance?.representativeSpectralPoint?.value;


    return (
        <>
            {goalLoading ? ('Loading...') :
                (
                    <Table.Tr>
                        <Table.Td>
                            {goal?._id}
                        </Table.Td>
                        <Table.Td c={hasAngularResolution ? "" : "yellow"}>
                            {hasAngularResolution ?
                                goal?.performance?.desiredAngularResolution?.value :
                                notSpecified
                            }
                        </Table.Td>
                        <Table.Td c={hasLargestScale ? "" : "yellow"}>
                            {hasLargestScale ?
                                goal?.performance?.desiredLargestScale?.value :
                                notSpecified
                            }
                        </Table.Td>
                        <Table.Td c={hasSensitivity ? "" : "yellow"}>
                            {hasSensitivity ?
                                goal?.performance?.desiredSensitivity?.value :
                                notSpecified
                            }
                        </Table.Td>
                        <Table.Td c={hasDynamicRange ? "" : "yellow"}>
                            {hasDynamicRange ?
                                goal?.performance?.desiredDynamicRange?.value :
                                notSpecified
                            }
                        </Table.Td>
                        <Table.Td c={hasSpectralPoint ? "" : "yellow"}>
                            {hasSpectralPoint ?
                                goal?.performance?.representativeSpectralPoint?.value :
                                notSpecified
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
                                        color={"red"}
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
                                <CloneButton toolTipLabel={"clone"} onClick={confirmClone} />
                                <DeleteButton toolTipLabel={"delete"} onClick={confirmDelete} />
                            </Group>
                        </Table.Td>
                    </Table.Tr>
                )
            }
        </>
    )
}