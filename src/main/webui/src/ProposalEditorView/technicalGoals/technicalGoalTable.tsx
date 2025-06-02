import {useParams} from 'react-router-dom';
import {Badge, DefaultMantineColor, Group, Space, Table, Text} from '@mantine/core';
import {modals} from '@mantine/modals';
import TechnicalGoalEditModal from './edit.modal.tsx';
import getErrorMessage from 'src/errorHandling/getErrorMessage.tsx';
import CloneButton from 'src/commonButtons/clone.tsx';
import DeleteButton from 'src/commonButtons/delete.tsx';
import {useQueryClient} from '@tanstack/react-query';
import {
    angularUnits,
    dynamicRangeUnits,
    fluxUnits,
    frequencyUnits,
    locateLabel
} from 'src/physicalUnits/PhysicalUnits.tsx';
import {ObjectIdentifier, ObservingProposal, TechnicalGoal} from 'src/generated/proposalToolSchemas.ts';
import {
    useTechnicalGoalResourceAddTechnicalGoal,
    useTechnicalGoalResourceRemoveTechnicalGoal
} from 'src/generated/proposalToolComponents.ts';
import {notSet} from './edit.group.tsx';
import {ReactElement, useContext} from 'react';
import {NO_ROW_SELECTED, POLARIS_MODES, TABLE_HIGH_LIGHT_COLOR} from 'src/constants.tsx';
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {ProposalContext} from "../../App2";
import {checkForFake} from "../observations/optical/fakeTechnicalGoal";

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
    proposalData: ObservingProposal,
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
    borderColor?: DefaultMantineColor,
    proposalData: ObservingProposal,
}

/**
 * builds the html for a technical goal row.
 *
 * @param {TechnicalGoalRowProps} technicalGoalRowProps the
 * id for this technical goal.
 * @return {ReactElement} the dynamic html for the technical goal row.
 * @constructor
 */
function TechnicalGoalRow(technicalGoalRowProps: TechnicalGoalRowProps):
    ReactElement {

    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const addMutation =
        useTechnicalGoalResourceAddTechnicalGoal();

    const removeMutation =
        useTechnicalGoalResourceRemoveTechnicalGoal();

    const theGoal = technicalGoalRowProps.proposalData.technicalGoals?.find(
        (technicalGoal: TechnicalGoal) => {
            return technicalGoal._id = technicalGoalRowProps.id
        });

    const polarisMode = useContext(ProposalContext).mode;

    if (theGoal == undefined) {
        return <pre>{getErrorMessage("no technical goal")}</pre>
    }

    /**
     * checks if the technical goal is used within any observation.
     * If so, the delete button is disabled.
     */
    const IsBound = (goal: TechnicalGoal | undefined): boolean => {
        return technicalGoalRowProps
            .boundTechnicalGoalIds?.includes(goal?._id) as boolean;
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
        removeMutation
            .mutate({
                pathParams: {
                    proposalCode: Number(selectedProposalCode),
                    technicalGoalId: technicalGoalRowProps.id
                }
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries().then();
                    notifySuccess("TechnicalGoal deleted",
                        "The selected technical goal has been deleted")
                },
                onError: (error) =>
                    notifyError(
                        "Failed to delete technical goal",
                        getErrorMessage(error)),
            })
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
                    Technical goal #{theGoal._id}
                </Text>
            </>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm: handleDelete
    })

    /**
     * processes the actual cloning of a technical goal.
     */
    const handleClone = (): void => {

        // create a new technicalGoal, which does not have its id set, but
        // contains the spectral and performance of the selected goal.
        const clonedGoal: TechnicalGoal = {
            performance: theGoal.performance,
            spectrum: theGoal.spectrum
        }

        //store the technical goal to the DB
        addMutation
            .mutate({
                pathParams: {
                    proposalCode: Number(selectedProposalCode)
                },
                body: clonedGoal,
            },{
                onSuccess: () => {
                    queryClient.invalidateQueries().then();
                    notifySuccess("Goal Cloned",
                        "The selected technical goal has been cloned");
                },
                onError: (error) =>
                    notifyError(
                        "Failed to clone technical goal",
                        getErrorMessage(error))
            })
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
                    Technical goal #{theGoal._id}
                </Text>
                <Space h={"xs"}/>
                <Text c={"gray.6"} size={"sm"}>
                    Creates a new technical goal with a clone of this technical
                    goal`s properties. You should edit the cloned technical
                    goal for your needs.
                </Text>
            </>
        ),
        labels: {confirm: 'Clone', cancel: 'Do not clone'},
        confirmProps: {color: 'blue'},
        onConfirm: handleClone
    })

    /**
     * function to handle row selection.
     *
     * @param {number | undefined} technicalGoalId the technical goal database
     * id that the selected row corresponds to.
     * @constructor
     */
    const RowSelector = (technicalGoalId: number | undefined): void => {

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

    if ((polarisMode == POLARIS_MODES.BOTH ||
            polarisMode == POLARIS_MODES.RADIO) && checkForFake(theGoal)) {
        return <></>
    }

    // return the full row.
    return (
        <Table.Tr onClick={() => {RowSelector(theGoal._id);}}
                  bg={technicalGoalRowProps.selectedTechnicalGoal === theGoal._id ?
                      TABLE_HIGH_LIGHT_COLOR:
                      undefined}>
            {
                theGoal.performance?.desiredAngularResolution?.value ?
                    <Table.Td>
                        {theGoal.performance?.desiredAngularResolution?.value}
                        {` ${ locateLabel(
                            angularUnits,
                            theGoal.performance?.desiredAngularResolution?.unit?.value)?.label }`}
                    </Table.Td> :
                    <Table.Td c={"yellow"}>
                        {notSet}
                    </Table.Td>
            }
            {
                theGoal.performance?.desiredLargestScale?.value ?
                    <Table.Td>
                        {theGoal.performance?.desiredLargestScale?.value}
                        {` ${ locateLabel(
                            angularUnits,
                            theGoal.performance?.desiredLargestScale?.unit?.value)?.label }`}
                    </Table.Td> :
                    <Table.Td c={"yellow"}>
                        {notSet}
                    </Table.Td>
            }
            {
                theGoal.performance?.desiredSensitivity?.value ?
                    <Table.Td>
                        {theGoal.performance?.desiredSensitivity?.value}
                        {` ${ locateLabel(
                            fluxUnits,
                            theGoal.performance?.desiredSensitivity?.unit?.value)?.label}`}
                    </Table.Td> :
                    <Table.Td c={"yellow"}>
                        {notSet}
                    </Table.Td>
            }
            {
                theGoal.performance?.desiredDynamicRange?.value ?
                    <Table.Td>
                        {theGoal.performance?.desiredDynamicRange?.value}
                        {` ${ locateLabel(dynamicRangeUnits,
                            theGoal.performance?.desiredDynamicRange?.unit?.value)?.label}`}
                    </Table.Td> :
                    <Table.Td c={"yellow"}>
                        {notSet}
                    </Table.Td>
            }
            {
                theGoal.performance?.representativeSpectralPoint?.value ?
                    <Table.Td>
                        {theGoal.performance?.representativeSpectralPoint?.value}
                        {` ${ locateLabel(frequencyUnits,
                            theGoal.performance?.representativeSpectralPoint?.unit?.value)?.label}`}
                    </Table.Td> :
                    <Table.Td c={"yellow"}>
                        {notSet}
                    </Table.Td>
            }
            <Table.Td>
                {
                    (theGoal.spectrum?.length ?? 0) > 0 ?
                        <Badge
                            color={"green"}
                            radius={0}
                        >
                            {theGoal.spectrum?.length}
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
                            <TechnicalGoalEditModal technicalGoal={theGoal} />
                        }
                        <CloneButton
                            toolTipLabel={"clone"}
                            onClick={confirmClone}
                        />
                        <DeleteButton
                            toolTipLabel={DeleteToolTip(theGoal)}
                            onClick={confirmDelete}
                            disabled={IsBound(theGoal)}
                        />
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
                <Table.Th>Angular Resolution</Table.Th>
                <Table.Th>Largest Scale</Table.Th>
                <Table.Th>Sensitivity</Table.Th>
                <Table.Th>Dynamic Range</Table.Th>
                <Table.Th>Spectral Point</Table.Th>
                <Table.Th>Spectral Windows</Table.Th>
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
    return (
        <Table
            highlightOnHover
            borderColor={props.borderColor}
        >
            {technicalGoalsHeader(props)}
            <Table.Tbody>
                {
                    props.goals?.map((goal) => {
                        return (
                            <TechnicalGoalRow
                                id={goal.dbid!}
                                key={goal.dbid!}
                                boundTechnicalGoalIds={props.boundTechnicalGoalIds}
                                showButtons={props.showButtons}
                                selectedTechnicalGoal={props.selectedTechnicalGoal}
                                setSelectedTechnicalGoal={props.setSelectedTechnicalGoal}
                                proposalData={props.proposalData}
                            />
                        )
                    })
                }
            </Table.Tbody>
        </Table>
    )
}