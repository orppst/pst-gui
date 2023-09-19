import {ActionIcon, Divider, Grid, Space, Switch, Text, Textarea} from "@mantine/core";
import {DateTimePicker} from "@mantine/dates";
import {IconTrash} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {randomId} from "@mantine/hooks";

//As a general reminder, Radio observations can be done at any time but Optical observations can occur only after
// sunset. In both cases the target must be above the horizon at the time

export default function ViewEditTimingWindows() {

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


    let nCols = 24;
    let rangeCol = 9;
    let avoidCol = 3;
    let noteCol = 9;
    let removeCol = 3;


    const targetsAdded = form.values.timingWindows.map((_item, index) => (
        <>
            <Grid.Col span={rangeCol}>
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
            <Grid.Col span={avoidCol}>
                <Switch
                    mt={"1rem"}
                    ml={"10%"}
                    {...form.getInputProps(`timingWindows.${index}.isAvoid`, {type: 'checkbox'})}
                />
            </Grid.Col>
            <Grid.Col span={noteCol}>
                <Textarea
                    autosize
                    minRows={3}
                    maxRows={3}
                    placeholder={"add optional note"}
                    {...form.getInputProps(`timingWindows.${index}.note`)}
                />
            </Grid.Col>
            <Grid.Col span={removeCol}>
                <ActionIcon
                    color={"red"}
                    variant={"filled"}
                    onClick={() => form.removeListItem("timingWindows", index) }
                >
                    <IconTrash size={"2rem"} />
                </ActionIcon>
            </Grid.Col>
            <Grid.Col span={nCols}>
                <Divider />
            </Grid.Col>
        </>
    ));

    return (
        <Grid columns={nCols} gutter={"xl"}>
            <Grid.Col span={rangeCol}>
                <Text size={"sm"}>Range</Text>
            </Grid.Col>
            <Grid.Col span={avoidCol}>
                <Text size={"sm"}>Avoid</Text>
            </Grid.Col>
            <Grid.Col span={noteCol}>
                <Text size={"sm"}>Note</Text>
            </Grid.Col>
            <Grid.Col span={removeCol}></Grid.Col>
            <Grid.Col span={nCols}>
                <Divider size={"xs"}/>
            </Grid.Col>
            {targetsAdded}
        </Grid>
    )
}