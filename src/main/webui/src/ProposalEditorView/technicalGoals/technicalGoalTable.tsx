import { useParams } from 'react-router-dom';
import {
    Badge,
    Group,
    Space,
    Table,
    Text,
    useMantineTheme
} from '@mantine/core';
import { modals } from '@mantine/modals';
import TechnicalGoalEditModal from './edit.modal.tsx';
import getErrorMessage from 'src/errorHandling/getErrorMessage.tsx';
import CloneButton from 'src/commonButtons/clone.tsx';
import DeleteButton from 'src/commonButtons/delete.tsx';
import { useQueryClient } from '@tanstack/react-query';
import {
    angularUnits,
    frequencyUnits,
    locateLabel,
    sensitivityUnits
} from 'src/physicalUnits/PhysicalUnits.tsx';
import {
    ObjectIdentifier,
    TechnicalGoal
} from 'src/generated/proposalToolSchemas.ts';
import {
    fetchTechnicalGoalResourceAddTechnicalGoal,
    fetchTechnicalGoalResourceRemoveTechnicalGoal,
    useTechnicalGoalResourceGetTechnicalGoal
} from 'src/generated/proposalToolComponents.ts';
import { notSet } from './edit.group.tsx';
import { ReactElement } from 'react';
import {
    ERROR_YELLOW,
    NO_ROW_SELECTED,
    TABLE_HIGH_LIGHT_COLOR
} from 'src/constants.tsx';
import {notifySuccess} from "../../commonPanel/notifications.tsx";

/** the technical goal id data holder.
 * @param {number} id the id
 * @param {number} key the forced key from React.
 * @param {(number | undefined)[] | undefined} boundTechnicalGoalIds the
 * technical goal ids that are bound up in observations.
 * @param {boolean} showButtons boolean stating if the table should contain
 * modification buttons.
 * @param {number | undefined} selectedTechnicalGoal the row to be highlighted
 * in selected mode. If undefined, the view is selected mode is turned off.
 * @param {(value: number) => void}} setSelectedTechnicalGoal function, if
 * defined for what to do when selected.
 */
export type TechnicalGoalRowProps = {
    id: number,
    key: number,
    boundTechnicalGoalIds: (number | undefined)[] | undefined,
    showButtons: boolean,
    selectedTechnicalGoal: number | undefined,
    setSelectedTechnicalGoal?: (value: number) => void,
};

/**
 * the technical goal table props.
 * @param { ObjectIdentifier[] | undefined} goals the array of goals to present.
 * @param {(number | undefined)[] | undefined} boundTechnicalGoalIds the array
 * of technical goal ids which are bound to observations.
 * @param {boolean} showButtons boolean stating if the table should contain
 * modification buttons.
 * @param {number | undefined} selectedTechnicalGoal the row to be highlighted
 * in selected mode. If undefined, the view is selected mode is turned off.
 * @param {(value: number) => void}} setSelectedTechnicalGoal function, if
 * defined for what to do when selected.
 *
 */
export type TechnicalGoalsTableProps = {
    goals: ObjectIdentifier[] | undefined,
    boundTechnicalGoalIds: (number | undefined)[] | undefined,
    showButtons: boolean,
    selectedTechnicalGoal: number | undefined,
    setSelectedTechnicalGoal?: (value: number) => void,
}

/**
 * builds the html for a technical goal row.
 *
 * @param {TechnicalGoalRowProps} technicalGoalRowProps the
 * id for this technical goal.
 * @return {ReactElement} the dynamic html for the technical goal row.
 * @constructor
 */
function TechnicalGoalRow(
        technicalGoalRowProps: TechnicalGoalRowProps):
    ReactElement {

    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const {data: goal, error: goalError, isLoading: goalLoading} =
        useTechnicalGoalResourceGetTechnicalGoal(
            {
                pathParams:
                    {
                        proposalCode: Number(selectedProposalCode),
                        technicalGoalId: technicalGoalRowProps.id
                    },
            }
        );

    if (goalError) {
        return <pre>{getErrorMessage(goalError)}</pre>
    }

    /**
     * checks if the technical goal is used within any observation.
     * If so, the delete button is disabled.
     */
    const IsBound = (goal: TechnicalGoal | undefined): boolean => {
        return technicalGoalRowProps.boundTechnicalGoalIds?.includes(
            goal?._id) as boolean;
    }

    /**
     * provides a tool tip for the delete button. Changing based off if the
     * technical goal is tied to an observation.
     *
     * @param {number | undefined} technicalGoal the technical goal id.
     * @return {string} the tooltip contents.
     * @constructor
     */
    const DeleteToolTip = (technicalGoal:  TechnicalGoal | undefined):
            string => {
        if (IsBound(technicalGoal)) {
            return "Delete disabled: Technical Goal in use by an Observation";
        }
        return "Remove this Goal from the Proposal";
    }

    /**
     * processes the actual deletion of a technical goal from the database.
     */
    const handleDelete = (): void => {
        fetchTechnicalGoalResourceRemoveTechnicalGoal( {
            pathParams: {proposalCode: Number(selectedProposalCode),
                         technicalGoalId: technicalGoalRowProps.id}
        })
            .then(()=>queryClient.invalidateQueries(
                {
                    predicate: (query) => {
                        // only invalidate the query for the entire list.
                        // not the separate bits.
                        return query.queryKey.length === 5 &&
                            query.queryKey[4] === 'technicalGoals';
                    }
                }
            ))
            .then(() => notifySuccess("TechnicalGoal deleted",
                    "message: The selected technical goal has been deleted"))
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
        const clonedGoal: TechnicalGoal = {
            performance: goal?.performance,
            spectrum: goal?.spectrum
        }

        // save the new clonedGoal to the database.
        fetchTechnicalGoalResourceAddTechnicalGoal( {
            pathParams: {proposalCode: Number(selectedProposalCode)},
            body: clonedGoal
        })
            .then(()=> queryClient.invalidateQueries())
            .then(() => notifySuccess("Goal Cloned",
                    "The selected technical goal has been cloned"))
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

    /**
     * function to handle row selection.
     *
     * @param {number | undefined} technicalGoalId the technical goal database
     * id that the selected row corresponds to.
     * @constructor
     */
    const RowSelector = (technicalGoalId: number | undefined): void => {
        console.debug(`row ${technicalGoalId} was selected`);

        // handle not having a selection option.
        if (!technicalGoalRowProps.setSelectedTechnicalGoal) {
            return;
        }

        // handle selection
        if (technicalGoalRowProps.selectedTechnicalGoal === technicalGoalId) {
            technicalGoalRowProps.setSelectedTechnicalGoal!(NO_ROW_SELECTED);
        } else {
            technicalGoalRowProps.setSelectedTechnicalGoal!(technicalGoalId!);
        }
    }

    // if still loading the goal, present a row with the text "loading"
    if (goalLoading) {
        return (
            <Table.Tr><Table.Td>
                'Loading...'
            </Table.Td></Table.Tr>
        )
    }

    // return the full row.
    return (
        <Table.Tr onClick={() => {RowSelector(goal?._id);}}
                  bg={technicalGoalRowProps.selectedTechnicalGoal === goal?._id ?
                      TABLE_HIGH_LIGHT_COLOR:
                      undefined}>
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
                    (goal?.spectrum?.length ?? 0) > 0 ?
                        <Badge
                            color={"green"}
                            radius={0}
                        >
                            {goal?.spectrum?.length}
                        </Badge>:
                        <Badge
                            color={"red"}
                            radius={0}
                        >
                            None
                        </Badge>
                }
            </Table.Td>

            {
                technicalGoalRowProps.showButtons ?
                <Table.Td>
                    <Group align={"right"}>
                        {
                            goalLoading ? 'Loading...' :
                                <TechnicalGoalEditModal technicalGoal={goal} />
                        }
                        <CloneButton toolTipLabel={"clone"}
                                     onClick={confirmClone} />
                        <DeleteButton toolTipLabel={DeleteToolTip(goal)}
                                      onClick={confirmDelete}
                                      disabled={IsBound(goal)?
                                          true :
                                          undefined}/>
                    </Group>
                </Table.Td>: null
            }
        </Table.Tr>
    )
}

/**
 * generates the technical goal header html.
 *
 * @param {TechnicalGoalsTableProps} props the table props.
 * @return {React.ReactElement} the dynamic html for the table header.
 */
function technicalGoalsHeader(props: TechnicalGoalsTableProps) : ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Angular resolution</Table.Th>
                <Table.Th>Largest scale</Table.Th>
                <Table.Th>Sensitivity</Table.Th>
                <Table.Th>Dynamic Range</Table.Th>
                <Table.Th>Spectral point</Table.Th>
                <Table.Th>Spectral windows</Table.Th>
                {
                    props.showButtons ?
                        <Table.Th></Table.Th>
                        : null
                }
            </Table.Tr>
        </Table.Thead>
    )
}

/**
 * generates the technical goals table.
 *
 * @param {TechnicalGoalsTableProps} props the input data to the table.
 * @return {React.ReactElement} the html for the technical goal table.
 * @constructor
 */
export function TechnicalGoalsTable(props: TechnicalGoalsTableProps): ReactElement {
    const theme = useMantineTheme();
    return (
        <Table highlightOnHover borderColor={
            props.selectedTechnicalGoal === NO_ROW_SELECTED ?
                theme.colors.yellow[ERROR_YELLOW]:
                undefined}>
            {technicalGoalsHeader(props)}
            <Table.Tbody>
                {
                    props.goals?.map((goal) => {
                        return (
                            <TechnicalGoalRow
                                id={goal.dbid!}
                                key={goal.dbid!}
                                boundTechnicalGoalIds={
                                    props.boundTechnicalGoalIds}
                                showButtons={props.showButtons}
                                selectedTechnicalGoal={
                                    props.selectedTechnicalGoal}
                                setSelectedTechnicalGoal={
                                    props.setSelectedTechnicalGoal}
                            />
                        )
                    })
                }
            </Table.Tbody>
        </Table>
    )
}