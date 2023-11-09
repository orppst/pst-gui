import {useParams} from "react-router-dom";
import {Badge, Group, Space, Table, Text} from "@mantine/core";
import {modals} from "@mantine/modals";
import TechnicalGoalEditModal from "./edit.modal.tsx";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import CloneButton from "../commonButtons/clone.tsx";
import DeleteButton from "../commonButtons/delete.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {
    angularUnits,
    frequencyUnits,
    sensitivityUnits,
    locateLabel } from '../physicalUnits/PhysicalUnits.tsx';
import { TechnicalGoal } from '../generated/proposalToolSchemas.ts';
import {
    fetchTechnicalGoalResourceAddTechnicalGoal,
    fetchTechnicalGoalResourceRemoveTechnicalGoal,
    useTechnicalGoalResourceGetTechnicalGoal
} from "../generated/proposalToolComponents.ts";
import {notifications} from "@mantine/notifications";
import {notSet} from "./edit.group.tsx";
import {ReactElement} from "react";

// the technical goal id data holder.
export type TechnicalGoalId = {id: number};

/**
 * builds the html for a technical goal row.
 *
 * @param {TechnicalGoalId} technicalGoalId the id for this technical goal.
 * @return {ReactElement} the dynamic html for the technical goal row.
 * @constructor
 */
export default function TechnicalGoalRow(
        technicalGoalId: TechnicalGoalId): ReactElement {

    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const {data: goal, error: goalError, isLoading: goalLoading} =
        useTechnicalGoalResourceGetTechnicalGoal(
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
    const handleDelete = (): void => {
        fetchTechnicalGoalResourceRemoveTechnicalGoal( {
            pathParams: {proposalCode: Number(selectedProposalCode),
                         technicalGoalId: technicalGoalId.id}
        })
            .then(()=>queryClient.invalidateQueries())
            .then(() => {
                notifications.show({
                    autoClose: false,
                    title: "TechnicalGoal deleted",
                    message: 'The selected technical goal has been deleted',
                    color: "green"
                })
            })
            .catch(console.error);
    }

    /**
     * create a safety check with the user to ensure they want to delete a
     * given technical goal.
     */
    const confirmDelete = (): void => modals.openConfirmModal({
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
    const handleClone = (): void => {
        console.log("Cloning Technical Goal")

        // create a new technicalGoal, which does not have its id set, but
        // contains the spectral and performance of the selected goal.
        let clonedGoal: TechnicalGoal = {
            performance: goal?.performance,
            spectrum: goal?.spectrum
        }

        // save the new clonedGoal to the database.
        fetchTechnicalGoalResourceAddTechnicalGoal( {
            pathParams: {proposalCode: Number(selectedProposalCode)},
            body: clonedGoal
        })
            .then(()=> queryClient.invalidateQueries())
            .then(() => {
                notifications.show({
                    autoClose: false,
                    title: "Technical Goal Cloned",
                    message: 'The selected technical goal has been cloned',
                    color: "green"
                })
            })
            .catch(console.error);
    }

    /**
     * create a safety check with the user to ensure they want to clone a
     * given technical goal.
     */
    const confirmClone = (): void => modals.openConfirmModal({
        title: 'Clone Technical Goal?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    Technical goal #{goal?._id}
                </Text>
                <Space h={"xs"}/>
                <Text c={"gray.6"} size={"sm"}>
                    Creates a new technical goal with a clone of this technical
                    goal's properties. You should edit the cloned technical
                    goal for your needs.
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
                        {
                            goal?.performance?.desiredAngularResolution?.value ?
                                <Table.Td>
                                    {goal?.performance?.desiredAngularResolution?.value}
                                    {` ${ locateLabel(
                                        angularUnits,
                                        goal?.performance?.desiredAngularResolution?.unit?.value)?.label }`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        {
                            goal?.performance?.desiredLargestScale?.value ?
                                <Table.Td>
                                    {goal?.performance?.desiredLargestScale?.value}
                                    {` ${ locateLabel(
                                        angularUnits,
                                        goal?.performance?.desiredLargestScale?.unit?.value)?.label }`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        {
                            goal?.performance?.desiredSensitivity?.value ?
                                <Table.Td>
                                    {goal?.performance?.desiredSensitivity?.value}
                                    {` ${ locateLabel(
                                        sensitivityUnits,
                                        goal?.performance?.desiredSensitivity?.unit?.value)?.label}`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        {
                            goal?.performance?.desiredDynamicRange?.value ?
                                <Table.Td>
                                    {goal?.performance?.desiredDynamicRange?.value}
                                    {` ${ locateLabel(sensitivityUnits,
                                        goal?.performance?.desiredDynamicRange?.unit?.value)?.label}`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        {
                            goal?.performance?.representativeSpectralPoint?.value ?
                                <Table.Td>
                                    {goal?.performance?.representativeSpectralPoint?.value}
                                    {` ${ locateLabel(frequencyUnits,
                                        goal?.performance?.representativeSpectralPoint?.unit?.value)?.label}`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
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
                                        <TechnicalGoalEditModal technicalGoal={goal} />
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

/**
 * generates the technical goal header html.
 *
 * @return {React.ReactElement} the dynamic html for the table header.
 */
export function technicalGoalsHeader() : ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Angular resolution</Table.Th>
                <Table.Th>Largest scale</Table.Th>
                <Table.Th>Sensitivity</Table.Th>
                <Table.Th>Dynamic Range</Table.Th>
                <Table.Th>Spectral point</Table.Th>
                <Table.Th>Spectral windows</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )
}