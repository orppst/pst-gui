import {Accordion, Grid, Group, Space, Switch, Textarea, Text} from "@mantine/core";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import { UseFormReturnType } from '@mantine/form';
import {randomId} from "@mantine/hooks";

import '@mantine/dates/styles.css'
import AddButton from "../commonButtons/add.tsx";
import { ObservationFormValues } from './edit.group.tsx';
import { AccordionDelete } from '../commonButtons/accordianControls.tsx';
import { ReactElement } from 'react';
import { TimingWindowGui } from './timingWindowGui.tsx';
import {fetchObservationResourceRemoveConstraint} from "../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {notifications} from "@mantine/notifications";


//Providing a UI for a TimingWindow:
// {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
// semantics of 'isAvoidConstraint' - true means avoid this date range, false
// means use this date range User may provide multiple "timing windows" per
// observation. These are stored as a List of Constraints in the Observation in
// the backend. TimingWindows may not be the only Constraints.

//As a general reminder, Radio observations can be done at any time but
// Optical observations can occur only after sunset. In both cases the target
// must be above the horizon at the time.

/**
 *
 * @param {UseFormReturnType<ObservationFormValues>} form the
 * form containing all the data to display.
 * @return {ReactElement} the HTML for the timing windows panel.
 * @constructor
 */
export default function TimingWindowsForm(
        form: UseFormReturnType<ObservationFormValues>): ReactElement {

    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    // constant used for populating new timing window guis.
    const EMPTY_TIMING_WINDOW : TimingWindowGui = {
        startTime: null,
        endTime: null,
        note: '',
        isAvoidConstraint: false,
        key: randomId(),
        id: 0
    }

    //Note: using Grid and Grid.Col to get the spacing correct for each element.
    // Using Group appears to leave a significant amount of unused space, so
    // below is the fixed sizes.

    // how many columns the window table should take.
    const MAX_COLUMNS_WINDOW_TABLE = 7;

    // how many columns the range requires.
    const MAX_COLUMNS_RANGE = 3;

    // how many columns the avoid element requires.
    const MAX_COLUMNS_AVOID = 1;

    // how many columns the note field requires.
    const MAX_COLUMNS_NOTE = 3;

    //character limit for the optional note about the timing window
    const MAX_CHARS_NOTE = 150;

    /**
     * handles the deletion of a timing window.
     *
     * @param {number} timingWindowId the database id for an existing timing window
     */
    const handleDelete = (timingWindowId: number) => {
        //existing timing window - remove it from the database
        fetchObservationResourceRemoveConstraint({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                observationId: form.values.observationId!,
                constraintId: timingWindowId
            }
        })
            .then(()=>queryClient.invalidateQueries())
            .then(() => {
                notifications.show({
                    autoClose: 3000,
                    title: "Deletion confirmed",
                    message: "The selected timing window has been deleted",
                    color: "green"
                })
            })
            .catch(console.error);
    }

    /**
     * Pops up a confirmation modal for the user before deletion
     * @param {number} index the map index of the timing window
     * @param {number} timingWindowId the database id of the timing window
     */
    const confirmDeletion = (index: number, timingWindowId: number) =>
        modals.openConfirmModal( {
            title: 'Delete Timing Window?',
            children: (
                <>
                    <Text c={"yellow"} size={"sm"}>
                        Removes Timing Window {index + 1} from the Observation
                    </Text>
                </>
            ),
            labels: {confirm: 'Delete', cancel: "No don't delete it"},
            confirmProps: {color: 'red'},
            onConfirm: () => handleDelete(timingWindowId),
            onCancel: () => {
                notifications.show({
                    autoClose: false,
                    title: "Deletion cancelled",
                    message: "User cancelled deletion of timing window",
                    color: "orange"
                })
            }
    })

    const windowsList = form.values.timingWindows.map(
        (tw: TimingWindowGui, index: number) => {
            let labelIndex = index + 1;
            return (
                <Accordion.Item value={labelIndex.toString()} key={tw.key}>
                    <AccordionDelete
                        title={"Window " + labelIndex}
                        deleteProps={{
                            toolTipLabel: 'delete timing window ' + labelIndex,
                            onClick: () => {
                                tw.id === 0 ? form.removeListItem('timingWindows', index) :
                                    confirmDeletion(index, tw.id);
                            }
                        }}
                    />
                    <Accordion.Panel>
                        <Grid columns={MAX_COLUMNS_WINDOW_TABLE}
                              gutter={"md"}>
                            <Grid.Col span={{
                                base: MAX_COLUMNS_WINDOW_TABLE,
                                lg: MAX_COLUMNS_RANGE}}>
                                <DateTimePicker
                                    placeholder={"start time"}
                                    minDate={new Date()}
                                    {...form.getInputProps(
                                        `timingWindows.${index}.startTime`)}
                                    rightSection={<Text>start</Text>}
                                    rightSectionWidth={50}
                                />
                                <Space h={"xs"}/>
                                <DateTimePicker
                                    placeholder={"end time"}
                                    minDate={new Date()}
                                    {...form.getInputProps(
                                        `timingWindows.${index}.endTime`)}
                                    rightSection={<Text>end</Text>}
                                    rightSectionWidth={50}
                                />
                            </Grid.Col>
                            <Grid.Col span={{
                                base: MAX_COLUMNS_WINDOW_TABLE,
                                lg: MAX_COLUMNS_AVOID}}>
                                <Switch
                                    onLabel={"avoid"}
                                    offLabel={""}
                                    size={"xl"}
                                    color={'grape'}
                                    radius={'xs'}
                                    mt={"1.5rem"}
                                    {...form.getInputProps(
                                        `timingWindows.${index}.isAvoidConstraint`,
                                        {type: 'checkbox'})}
                                />
                            </Grid.Col>
                            <Grid.Col span={{
                                base: MAX_COLUMNS_WINDOW_TABLE,
                                lg: MAX_COLUMNS_NOTE}}>
                                <Textarea
                                    autosize
                                    minRows={3}
                                    maxRows={3}
                                    maxLength={MAX_CHARS_NOTE}
                                    description={
                                        MAX_CHARS_NOTE -
                                        form.values.timingWindows[index].note.length +
                                        "/" + String(MAX_CHARS_NOTE)}
                                    inputWrapperOrder={[
                                        'label', 'error', 'input', 'description']}
                                    placeholder={"add optional note"}
                                    {...form.getInputProps(
                                        `timingWindows.${index}.note`)}
                                />
                            </Grid.Col>
                        </Grid>
                    </Accordion.Panel>
                </Accordion.Item>
            )
    });

    return (
        <DatesProvider settings={{timezone: 'UTC'}}>
            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                {windowsList}
            </Accordion>
            <Space h={"lg"}/>
            <Group justify={"center"}>
                <AddButton
                    toolTipLabel={"add a timing window"}
                    onClick={() => form.insertListItem(
                        'timingWindows',
                        {...EMPTY_TIMING_WINDOW, key: randomId()})}
                />
            </Group>
        </DatesProvider>
    )
}