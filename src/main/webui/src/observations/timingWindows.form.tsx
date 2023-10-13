import {Accordion, ActionIcon, Box, Grid, Group, Space, Switch, Textarea} from "@mantine/core";
import {DateTimePicker} from "@mantine/dates";
import {IconTrash} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {randomId} from "@mantine/hooks";

import '@mantine/dates/styles.css'
import SaveButton from "../commonButtons/save.tsx";
import AddButton from "../commonButtons/add.tsx";

//As a general reminder, Radio observations can be done at any time but Optical observations can occur only after
// sunset. In both cases the target must be above the horizon at the time

export default function TimingWindowsForm() {

    //Providing a UI for a TimingWindow: {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
    // semantics of 'isAvoidConstraint' - true means avoid this date range, false means use this date range
    // User may provide multiple "timing windows" per observation. These are stored as a List of Constraints
    // in the Observation in the backend. TimingWindows may not be the only Constraints.

    //Note: using Grid and Grid.Col to get the spacing correct for each element. Using Group appears to leave
    // a significant amount of space unused

    interface TimingWindowsValues {
        timingWindows: {
            start: Date | null,
            end: Date | null,
            note: string,
            isAvoid: boolean,
            key: string
        }[]
    }

    let timingWindowInitial = {
        start: null,
        end: null,
        note: '',
        isAvoid: false,
        key: randomId()
    }

    const form = useForm<TimingWindowsValues>({
        initialValues: {
            timingWindows: [timingWindowInitial]
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


    const targetsAdded = form.values.timingWindows.map((_item, index) => (
        <Accordion.Item value={(index + 1).toString()}>
            <AccordionControl index={index} />
            <Accordion.Panel>
                <Grid columns={nCols} gutter={"md"}>
                    <Grid.Col span={{base: nCols, lg: rangeCol}}>
                        <DateTimePicker
                            placeholder={"start time"}
                            allowDeselect
                            minDate={new Date()}
                            {...form.getInputProps(`timingWindows.${index}.start`)}
                        />
                        <Space h={"xs"}/>
                        <DateTimePicker
                            placeholder={"end time"}
                            minDate={new Date()}
                            {...form.getInputProps(`timingWindows.${index}.end`)}
                        />
                    </Grid.Col>
                    <Grid.Col span={{base: nCols, lg: avoidCol}}>
                        <Switch
                            onLabel={"avoid"}
                            offLabel={""}
                            color={'grape'}
                            radius={'xs'}
                            mt={"1.5rem"}
                            ml={"10%"}
                            {...form.getInputProps(`timingWindows.${index}.isAvoid`, {type: 'checkbox'})}
                        />
                    </Grid.Col>
                    <Grid.Col span={{base: nCols, lg: noteCol}}>
                        <Textarea
                            autosize
                            minRows={3}
                            maxRows={3}
                            placeholder={"add optional note"}
                            {...form.getInputProps(`timingWindows.${index}.note`)}
                        />
                    </Grid.Col>
                </Grid>
            </Accordion.Panel>
        </Accordion.Item>
    ));

    const handleSubmit = form.onSubmit((values) => {
        console.log(values)
    })

    return (
        <form onSubmit={handleSubmit}>
            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                {targetsAdded}
            </Accordion>
            <Group justify={"flex-end"}>
                <AddButton
                    toolTipLabel={"add a timing window"}
                    onClick={() => form.insertListItem('timingWindows',
                        {...timingWindowInitial, key: randomId()})}
                />
            </Group>
            <Space h={"xs"} />
            <Group justify={"flex-end"}>
                <SaveButton toolTipLabel={"save changes"}/>
            </Group>
        </form>
    )
}