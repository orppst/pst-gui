import {
    useObservationResourceAddNewObservation,
    useObservationResourceGetObservation,
    useObservationResourceRemoveObservation, useProposalResourceRemoveField
} from "src/generated/proposalToolComponents.ts";
import {
    Text,
    Space,
    Badge,
    Group,
    Table,
    useMantineTheme
} from '@mantine/core';
import {modals} from "@mantine/modals";
import {
    CalibrationObservation, Observation,
    PerformanceParameters,
    TargetObservation,
} from "src/generated/proposalToolSchemas.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import getErrorMessage from "src/errorHandling/getErrorMessage.tsx";
import CloneButton from "src/commonButtons/clone.tsx";
import DeleteButton from "src/commonButtons/delete.tsx";
import {ReactElement} from 'react';
import {notifyError, notifySuccess} from "../../../commonPanel/notifications.tsx";
import {
    useOpticalTelescopeResourceDeleteObservationTelescopeData,
} from "../../../util/telescopeComms";
import ObservationEditModal from "./editOptical.modal";

export type ObservationId = {id: number}

/**
 * creates an Observation row.
 * @param {ObservationId} observationId the observation id.
 * @return {ReactElement} the react html for the observation row.
 * @constructor
 */
function ObservationRow(observationId: ObservationId):
        ReactElement {

    const queryClient = useQueryClient();

    //mutation hooks
    const addObservation =
        useObservationResourceAddNewObservation();
    const removeObservation =
        useObservationResourceRemoveObservation();
    const deleteOpticalTelescope =
        useOpticalTelescopeResourceDeleteObservationTelescopeData();
    const removeField =
        useProposalResourceRemoveField();

    // the colour gray used by the tools.
    const theme = useMantineTheme();
    const GRAY = theme.colors.gray[6];

    const {selectedProposalCode} = useParams();


    let targetName = "Unknown";
    let additionTargets = 0;

    // get observation data.
    const {
        data: observation,
        error: observationError,
        isLoading: observationLoading
    } = useObservationResourceGetObservation({
        pathParams: {
            proposalCode: Number(selectedProposalCode),
            observationId: observationId.id,
        },
    });

    if (observationError) {
        return <pre>{getErrorMessage(observationError)}</pre>
    }

    /**
     * function for handling deletion of telescope data.
     */
    const handleDeletionOfOpticalTelescopeData = async () => {
        // really this needs to be done from backend to backend, to
        // ensure transactional integrity. but oh well.
        if (selectedProposalCode !== undefined) {
            deleteOpticalTelescope.mutate({
                proposalID: selectedProposalCode,
                observationID: observationId.id.toString()
            }, {
                onSuccess: () => {
                    notifySuccess(
                        "Observation removed",
                        "Selected observation and optical " +
                        "telescope data has been deleted.")
                },
                onError: (error) => {
                    notifyError(
                        "Deletion of Observing Field optical " +
                        "telescope data failed",
                        getErrorMessage(error));
                }
            })
        }
    }

    /**
     * handles the deletion of an observation.
     */
    const handleDelete = async () => {
        const fieldIdRaw = observation?.field?._id
        const fieldId = fieldIdRaw!

        await removeObservation.mutateAsync({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                observationId: observationId.id
            }
        }, {
            onSuccess: () => {
                handleDeletionOfOpticalTelescopeData();
            },
            onError: (error) =>
                notifyError("Deletion of Observing Field failed",
                            getErrorMessage(error)),
        })

        removeField.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                fieldId: fieldId
            }
        })
    }

    /**
     * handles the confirmation to the user for deletion of an observation.
     */
    const confirmDeletion = () => modals.openConfirmModal({
        title: 'Delete Observation?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    {(observation?.["@type"] === 'proposal:TargetObservation')
                        ? 'Target' : 'Calibration'}
                    Observation of {observation?.target?.length} target(s)
                </Text>
                <Space h={"sm"}/>
                <Text c={GRAY} size={"sm"}>
                    Deletes the observation only.
                    Preserves everything except the timing windows.
                </Text>
            </>
        ),
        labels: {confirm: 'Delete', cancel: "No don't delete it"},
        confirmProps: {color: 'red'},
        onConfirm() {handleDelete().then(()=> queryClient.invalidateQueries())}
    })

    /**
     * handles the cloning of an observation.
     */
    const handleClone = () => {
        //create a new observation with the details of the current observation
        addObservation.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            },
            body: observation?.["@type"] === 'proposal:TargetObservation' ?
                observation! as TargetObservation :
                observation! as CalibrationObservation
        }, {
            onSuccess: () => queryClient.invalidateQueries(),
            onError: (error) =>
                notifyError("Clone Failed", getErrorMessage(error))
        })
    }

    /**
     * set main target name and number of additional targets
     * provided everything is defined
     */
    if(observation?.target !== undefined
        && observation.target[0] !== undefined
        && observation.target[0].sourceName !== undefined) {
        targetName = observation.target[0].sourceName;
        additionTargets = observation.target.length - 1;
    }

    /**
     * handles the confirmation from the user that they intend to clone
     * an observation.
     */
    const confirmClone = () => modals.openConfirmModal({
        title: 'Clone Observation?',
        children: (
            <>
                <Text c={"yellow"} size={"sm"}>
                    {(observation?.["@type"] === 'proposal:TargetObservation')
                        ? 'Target' : 'Calibration'}
                    {` : ` + targetName + (additionTargets > 0?
                        ` (plus ` + additionTargets + ` more)`:``)}
                </Text>
                <Space h={"sm"}/>
                <Text c={GRAY} size={"sm"}>
                    Creates a new observation with a deep copy of this
                    observation`s properties. You should edit the copied
                    observation for your needs.
                </Text>
            </>
        ),
        labels: {confirm: 'Clone', cancel: 'Do not clone'},
        confirmProps: {color: 'blue'},
        onConfirm() {handleClone()},
        onCancel:() => console.log('Cancel clone'),
    })

    const performanceRaw = observation?.technicalGoal?.performance;
    const performance : PerformanceParameters = performanceRaw!

    const performanceFull = observationLoading ? false :
        performance.desiredAngularResolution?.value !== undefined &&
        performance.representativeSpectralPoint?.value !== undefined &&
        performance.desiredDynamicRange?.value !== undefined &&
        performance.desiredSensitivity?.value !== undefined &&
        performance.desiredLargestScale?.value !== undefined;

    const performanceEmpty = observationLoading ? true :
        performance.desiredAngularResolution?.value === undefined &&
        performance.representativeSpectralPoint?.value === undefined &&
        performance.desiredDynamicRange?.value === undefined &&
        performance.desiredSensitivity?.value === undefined &&
        performance.desiredLargestScale?.value === undefined;


    // if loading, present a loading.
    if (observationLoading) {
        return (
            <Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>
        );
    }

    // generate the correct row.
    return (
        <Table.Tr>
            <Table.Td>
                {targetName}
            </Table.Td>
            <Table.Td>
                {additionTargets? additionTargets : '-'}
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
                <Group align={"right"}>
                    {
                        observationLoading ? 'Loading...' :
                        <ObservationEditModal observation={observation}/>
                    }
                    <CloneButton toolTipLabel={"clone"}
                                 onClick={confirmClone} />
                    <DeleteButton toolTipLabel={"delete"}
                                  onClick={confirmDeletion} />
                </Group>
            </Table.Td>
        </Table.Tr>
    )
}

/**
 * generates the observation table html.
 *
 * @return {React.ReactElement} the dynamic html for the observation table.
 * @constructor
 */
export const OpticalTableGenerator = (observations:  Observation[]):
        ReactElement => {
    return (
        <>
            <h2>Optical Telescopes</h2>
            <Table>
                { observationOpticalTableHeader() }
                <Table.Tbody>
                    {
                        observations?.map((observation) => {
                            return (
                                <ObservationRow
                                    id={observation._id!}
                                    key={observation._id!}
                                />
                            )
                        })
                    }
                </Table.Tbody>
            </Table>
        </>
    )
}

/**
 * returns the header for the observation optical table.
 *
 * @return {React.ReactElement} the html for the table header.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function observationOpticalTableHeader(): ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Target name</Table.Th>
                <Table.Th>Additional Targets</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Field</Table.Th>
                <Table.Th>Telescope Name</Table.Th>
                <Table.Th>Telescope Instrument</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    );
}