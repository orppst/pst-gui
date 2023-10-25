import {Accordion, ActionIcon, Box, Grid, Group, Space, Switch, Textarea} from "@mantine/core";
import {DateTimePicker} from "@mantine/dates";
import {IconTrash} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {randomId} from "@mantine/hooks";

import '@mantine/dates/styles.css'
import SaveButton from "../commonButtons/save.tsx";
import AddButton from "../commonButtons/add.tsx";
import {TimingWindows} from "./edit.group.tsx";
import {TimingWindow} from "../generated/proposalToolSchemas.ts";

//As a general reminder, Radio observations can be done at any time but Optical observations can occur only after
// sunset. In both cases the target must be above the horizon at the time

type TimingWindowTsx = {
    startTime: Date | null,
    endTime: Date | null,
    note: string,
    isAvoidConstraint: boolean,
    key: string
}

interface TimingWindowValues {
    timingWindows: TimingWindowTsx[]
}


//type TimingWindow in proposalToolSchemas.ts has 'startTime' and 'endTime' as strings (ISO strings).
// We need to convert these to type Date before using them with the 'DateTimePicker' element

function ConvertToTimingWindowTsx(input: TimingWindow) : TimingWindowTsx {
    return ({
        startTime: new Date(input.startTime!),
        endTime: new Date(input.endTime!),
        note: input.note!,
        isAvoidConstraint: input.isAvoidConstraint!,
        key: randomId()
    })
}


export default function TimingWindowsForm(props?: TimingWindows) {

    //Providing a UI for a TimingWindow: {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
    // semantics of 'isAvoidConstraint' - true means avoid this date range, false means use this date range
    // User may provide multiple "timing windows" per observation. These are stored as a List of Constraints
    // in the Observation in the backend. TimingWindows may not be the only Constraints.

    if(props) props.timingWindows.map((timingWindow)=>{console.log(timingWindow)})

    let emptyTimingWindow : TimingWindowTsx = {
        startTime: null, endTime: null, note: '', isAvoidConstraint: false, key: randomId()
    }


    let initialTimingWindows = props && props.timingWindows.length > 0 ?
        props.timingWindows.map((timingWindow) => {
        return ConvertToTimingWindowTsx(timingWindow);}) :
        [emptyTimingWindow];


    const form
        = useForm<TimingWindowValues>({
        initialValues: {
            timingWindows: initialTimingWindows
        },

        validate: {

        },
    })


    let nCols = 7;
    let rangeCol = 3;
    let avoidCol = 1;
    let noteCol = 3;


    function AccordionControl(props : {index: number}) {
        return (
            <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Accordion.Control>Window {props.index + 1}</Accordion.Control>
                <ActionIcon
                    color={"red.5"}
                    variant={"subtle"}
                    onClick={() =>form.removeListItem("timingWindows", props.index)}
                >
                    <IconTrash size={"1rem"}/>
                </ActionIcon>
            </Box>
        )
    }

    //Note: using Grid and Grid.Col to get the spacing correct for each element. Using Group appears to leave
    // a significant amount of space unused

    //TODO: ensure the DateTimePicker uses UTC - default seems to be locale, e.g. BST for me

    const windowsAdded = form.values.timingWindows.map((item, index) => {
        return (
            <Accordion.Item value={(index + 1).toString()} key={item.key}>
                <AccordionControl index={index} />
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
                                description={150 - form.values.timingWindows[index].note.length + "/150"}
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

    const handleSubmit = form.onSubmit((values) => {
        console.log(values)
    })

    return (
        <form onSubmit={handleSubmit}>
            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                {windowsAdded}
            </Accordion>
            <Group justify={"flex-end"}>
                <AddButton
                    toolTipLabel={"add a timing window"}
                    onClick={() => form.insertListItem('timingWindows',
                        {...emptyTimingWindow, key: randomId()})}
                />
            </Group>
            <Space h={"xs"} />
            <Group justify={"flex-end"}>
                <SaveButton toolTipLabel={"save changes"}/>
            </Group>
        </form>
    )
}