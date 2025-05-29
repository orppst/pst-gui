import {
    useObservationResourceAddNewObservation,
    useObservationResourceRemoveObservation, useProposalResourceRemoveField
} from "src/generated/proposalToolComponents.ts";
import {
    Text,
    Space,
    Group,
    Table,
    useMantineTheme
} from '@mantine/core';
import {modals} from "@mantine/modals";
import {
    CalibrationObservation, Observation, ObservingProposal,
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
    TelescopeTableState,
    useOpticalTelescopeResourceDeleteObservationTelescopeData,
} from "../../../util/telescopeComms";
import ObservationEditModal from "./editOptical.modal";
import {getTargetName} from "../commonObservationCode";

export type ObservationId = {id: number}

/**
 * creates an Observation row.
 * @param {ObservationId} observationId the observation id.
 * @param {Map<string, TelescopeTableState>} opticalData the telescope data
 * @param {Observation} observation the given observation.
 * @param {ObservingProposal} proposal the propoisla.
 * @return {ReactElement} the react html for the observation row.
 * @constructor
 */
function ObservationRow(
    {
        id,
        opticalData,
        observation,
        proposal,
    }: { // This defines the type of the single props object
        id: number,
        opticalData: Map<string, TelescopeTableState>,
        observation: Observation,
        proposal: ObservingProposal,
    }
        ):
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

    let {selectedProposalCode} = useParams();
    selectedProposalCode = selectedProposalCode!;

    let targetName = "Unknown";
    let additionTargets = 0;

    /**
     * function for handling deletion of telescope data.
     */
    const handleDeletionOfOpticalTelescopeData = async () => {
        // really this needs to be done from backend to backend, to
        // ensure transactional integrity. but oh well.
        if (selectedProposalCode !== undefined) {
            deleteOpticalTelescope.mutate({
                proposalID: selectedProposalCode,
                observationID: id.toString()
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
        const fieldIdRaw = observation.field?._id
        const fieldId = fieldIdRaw!

        await removeObservation.mutateAsync({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                observationId: id
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
                    {(observation["@type"] === 'proposal:TargetObservation')
                        ? 'Target' : 'Calibration'}
                    Observation of {observation.target?.length} target(s)
                </Text>
                <Space h={"sm"}/>
                <Text c={GRAY} size={"sm"}>
                    Deletes the observation only.
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
                observation as TargetObservation :
                observation as CalibrationObservation
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

    if(observation?.target !== undefined) {
        additionTargets = observation.target.length - 1;
    }
    targetName = getTargetName(observation, proposal);

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

    // get the row data
    const opticalDataRow = opticalData!.get(observation._id!.toString())!;

    //handle error row.
    if(opticalDataRow == undefined) {
        return <></>
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
                {observation.field?.name}
            </Table.Td>
            <Table.Td>
                {opticalDataRow.telescopeName}
            </Table.Td>
            <Table.Td>
                {opticalDataRow.instrumentName}
            </Table.Td>
            <Table.Td>
                <Group align={"right"}>
                    {
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
 * @param observations the observations array.
 * @param {Map<string, TelescopeTableState>} opticalData: the telescope data.
 * @param {boolean} showButtons boolean flag for showing buttons.
 * @param {ObservingProposal} proposal the proposal data.
 * @return {React.ReactElement} the dynamic html for the observation table.
 * @constructor
 */
export const OpticalTableGenerator = (
        observations:  Observation[],
        opticalData: Map<string, TelescopeTableState>,
        showButtons: boolean,
        proposal: ObservingProposal):
        ReactElement => {
    return (
        <>
            <Table>
                { observationOpticalTableHeader(showButtons) }
                <Table.Tbody>
                    {
                        observations?.map((observation) => {
                            return (
                                <ObservationRow
                                    id={observation._id!}
                                    key={observation._id!}
                                    opticalData={opticalData}
                                    observation={observation}
                                    proposal={proposal}
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
 * @param {boolean} showButtons boolean flag for showing the buttons.
 * @return {React.ReactElement} the html for the table header.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function observationOpticalTableHeader(showButtons: boolean): ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Target name</Table.Th>
                <Table.Th>Additional Targets</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Field</Table.Th>
                <Table.Th>Telescope Name</Table.Th>
                <Table.Th>Telescope Instrument</Table.Th>
                { showButtons ? <Table.Th></Table.Th>: null }
            </Table.Tr>
        </Table.Thead>
    );
}