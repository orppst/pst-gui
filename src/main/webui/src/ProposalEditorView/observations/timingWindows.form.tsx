import {Accordion, Grid, Group, Space, Switch, Textarea, Text} from "@mantine/core";
import {DateInput, DatesProvider} from "@mantine/dates";
import { UseFormReturnType } from '@mantine/form';
import {randomId} from "@mantine/hooks";

import '@mantine/dates/styles.css'
import AddButton from "src/commonButtons/add.tsx";
import { ObservationFormValues } from './edit.group.tsx';
import {AccordionRemove} from 'src/commonButtons/accordianControls.tsx';
import { ReactElement } from 'react';
import { TimingWindowGui } from './timingWindowGui.tsx';
import {
    useObservationResourceRemoveConstraint
} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import {notifyError, notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {queryKeyProposals} from "../../queryKeyProposals.tsx";


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
    {form}: {form: UseFormReturnType<ObservationFormValues>}): ReactElement {

    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    const removeConstraint =
        useObservationResourceRemoveConstraint();

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
        removeConstraint.mutate({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                observationId: form.getValues().observationId!,
                constraintId: timingWindowId
            }
        } , {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: queryKeyProposals({
                        proposalId: Number(selectedProposalCode),
                        childName: "observations",
                        childId: form.getValues().observationId!
                    }),
                }).then( () => notifySuccess("Deletion confirmed",
                    "The selected timing window has been deleted"));
            },
            onError: (error) =>
                notifyError("Failed to remove timing window", getErrorMessage(error)),
        })
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
                notifyInfo("Deletion cancelled", "User cancelled deletion of timing window")
            }
    })

    const windowsList = form.getValues().timingWindows.map(
        (tw: TimingWindowGui, index: number) => {
            let labelIndex = index + 1;
            return (
                <Accordion.Item value={labelIndex.toString()} key={tw.key}>
                    <AccordionRemove
                        title={"Window " + labelIndex}
                        removeProps={{
                            toolTipLabel: 'remove timing window ' + labelIndex,
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
                                <DateInput
                                    valueFormat={"YYYY/MM/DD HH:mm"}
                                    placeholder={"start time - YYYY/MM/DD HH:mm"}
                                    minDate={new Date()}
                                    maxDate={tw.endTime != null ?
                                        tw.endTime : undefined}
                                    {...form.getInputProps(
                                        `timingWindows.${index}.startTime`)}
                                    rightSection={<Text>start</Text>}
                                    rightSectionWidth={50}
                                />
                                <Space h={"xs"}/>
                                <DateInput
                                    valueFormat={"YYYY/MM/DD HH:mm"}
                                    placeholder={"end time - YYYY/MM/DD HH:mm"}
                                    minDate={tw.startTime != null?
                                        new Date() > tw.startTime ?
                                            new Date() : tw.startTime
                                        : new Date()}
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
                                        form.getValues().timingWindows[index].note.length +
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