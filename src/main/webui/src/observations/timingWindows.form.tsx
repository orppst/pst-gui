import {Accordion, Grid, Group, Space, Switch, Textarea} from "@mantine/core";
import {DateTimePicker} from "@mantine/dates";
import { UseFormReturnType } from '@mantine/form';
import {randomId} from "@mantine/hooks";

import '@mantine/dates/styles.css'
import AddButton from "../commonButtons/add.tsx";
import { ObservationFormValues } from './edit.group.tsx';
import {TimingWindow} from "../generated/proposalToolSchemas.ts";
import { AccordionDelete } from '../commonButtons/accordianControls.tsx';


//Providing a UI for a TimingWindow: {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
// semantics of 'isAvoidConstraint' - true means avoid this date range, false means use this date range
// User may provide multiple "timing windows" per observation. These are stored as a List of Constraints
// in the Observation in the backend. TimingWindows may not be the only Constraints.

//FIXME: This currently only ADDS new timing windows to the specified observation.
// -- for example, it will display all currently added timing windows and if you try to edit one of those
//    (and press the 'save' button) it will instead add a new timing window with the new data (note this won't
//    show up until you close and re-open the modal).
// We need to be able to edit existing timing windows or at least be able to delete them to replace them with
// a new window.
// -- this issue stems from having no access to the timing window database IDs

//As a general reminder, Radio observations can be done at any time but Optical observations can occur only after
// sunset. In both cases the target must be above the horizon at the time

//type to use for the DateTimePickers
type TimingWindowGui = {
    startTime: Date | null,
    endTime: Date | null,
    note: string,
    isAvoidConstraint: boolean,
    key: string
}

//type to use to pass data to the API
type TimingWindowApi = {
    "@type": string,
    startTime: number,
    endTime: number,
    note: string,
    isAvoidConstraint: boolean,
}

export default function TimingWindowsForm(form: UseFormReturnType<ObservationFormValues>) {
    let emptyTimingWindow : TimingWindowGui = {
        startTime: null, endTime: null, note: '', isAvoidConstraint: false, key: randomId()
    }

    /*
        Type TimingWindow in proposalToolSchemas.ts has 'startTime' and 'endTime' as date strings (ISO8601 strings).
        We need to convert these to type Date before using them with the 'DateTimePicker' element
     */
    function ConvertToTimingWindowGui(input: TimingWindow) : TimingWindowGui {
        return ({
            startTime: new Date(input.startTime!),
            endTime: new Date(input.endTime!),
            note: input.note!,
            isAvoidConstraint: input.isAvoidConstraint!,
            key: randomId()
        })
    }

    /*
     Note: API expects the Dates as the number of seconds since the posix epoch
     */
    function ConvertToTimingWindowApi(input: TimingWindowGui) : TimingWindowApi {
        return ({
            "@type": "proposal:TimingWindow",
            startTime: input.startTime!.getTime(),
            endTime: input.endTime!.getTime(),
            note: input.note,
            isAvoidConstraint: input.isAvoidConstraint
        })
    }

    const handleDelete = (index: number) => {
        alert("Removes the list item only - does not yet delete the timing window from the database")
        form.removeListItem('timingWindows', index);
        //todo: call API function to delete timing window from the database (requires the DB ID)
    }

    //Note: using Grid and Grid.Col to get the spacing correct for each element. Using Group appears to leave
    // a significant amount of unused space
    let nCols = 7;
    let rangeCol = 3;
    let avoidCol = 1;
    let noteCol = 3;

    const windowsList = form.values.timingWindows.timingWindows.map((item, index) => {
        let labelIndex = index + 1;
        // @ts-ignore
        return (
            <Accordion.Item value={labelIndex.toString()} key={item.key}>
                <AccordionDelete
                    title={"Window " + labelIndex}
                    deleteProps={{
                        toolTipLabel: 'delete timing window ' + labelIndex,
                        onClick: () => handleDelete(index)
                    }}
                />
                <Accordion.Panel>
                    <Grid columns={nCols} gutter={"md"}>
                        <Grid.Col span={{base: nCols, lg: rangeCol}}>
                            <DateTimePicker
                                placeholder={"start time"}
                                minDate={new Date()}
                                {...form.getInputProps(`timingWindows.${index}.startTime`)}
                            />
                            <Space h={"xs"}/>
                            <DateTimePicker
                                placeholder={"end time"}
                                minDate={new Date()}
                                {...form.getInputProps(`timingWindows.${index}.endTime`)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base: nCols, lg: avoidCol}}>
                            <Switch
                                onLabel={"avoid"}
                                offLabel={""}
                                size={"xl"}
                                color={'grape'}
                                radius={'xs'}
                                mt={"1.5rem"}
                                {...form.getInputProps(`timingWindows.${index}.isAvoidConstraint`, {type: 'checkbox'})}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base: nCols, lg: noteCol}}>
                            <Textarea
                                autosize
                                minRows={3}
                                maxRows={3}
                                maxLength={150}
                                description={150 - form.values.timingWindows.timingWindows[index].note.length + "/150"}
                                inputWrapperOrder={['label', 'error', 'input', 'description']}
                                placeholder={"add optional note"}
                                {...form.getInputProps(`timingWindows.${index}.note`)}
                            />
                        </Grid.Col>
                    </Grid>
                </Accordion.Panel>
            </Accordion.Item>
        )
    });

    return (
        <>
            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                {windowsList}
            </Accordion>
            <Group justify={"flex-end"}>
                <AddButton
                    toolTipLabel={"add a timing window"}
                    onClick={() => form.insertListItem('timingWindows',
                        {...emptyTimingWindow, key: randomId()})}
                />
            </Group>
        </>
    )
}