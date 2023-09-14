import {useForm} from "@mantine/form";
import {useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {
    ActionIcon,
    Button, Container, Divider,
    Grid,
    Group, NumberInput,
    Select,
    Space,
    Switch, Text,
    Textarea,
    Tooltip
} from "@mantine/core";
import {useParams} from "react-router-dom";
import {TargetId} from "./List.tsx";
import {DateTimePicker} from "@mantine/dates";
import {RenderTarget} from "../targets/RenderTarget.tsx";
import {randomId} from "@mantine/hooks";
import {IconPlus, IconTrash} from "@tabler/icons-react";

interface ObservationFormValues {
    observationType: 'Target'|'Calibration'|'';
    calibrationUse:  'Amplitude'|'Atmospheric'|'Bandpass'|'Phase'|'Pointing'|'Focus'|'Polarization'|'Delay'|'',
    targetDBId: number,
    timingWindows: {
        start: Date | null,
        end: Date | null,
        note: string,
        isAvoid: boolean,
        key: string
    }[]
}

/*
  We may want to do this in tabs with a stepper, there's a significant amount of detail for
  one page:

  1. select target and observation type
  2. set technical goals and the "field"
  3. select timing-windows
 */


export function ObservationForm (props: TargetId){

    // we need a valid form.values.targetDBId before we call the
    // useProposalResourceGetTarget hook. We get this from the 'props' passed in from calling environment

    const { selectedProposalCode} = useParams();

    let timingWindowInitial = {
        start: null,
        end: null,
        note: '',
        isAvoid: false,
        key: randomId()
    }

    const form = useForm<ObservationFormValues>({
        initialValues: {
            observationType:'',
            calibrationUse:'',
            targetDBId: props.id!,
            timingWindows: [timingWindowInitial]
        },

        validate: {

        },
    });

    const { data: targets , error: targetListError, isLoading: targetsLoading } =
        useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)}}, {enabled: true});

    function SelectTargets() {

        if (targetListError) {
            return (
                <div>
                    <pre>{JSON.stringify(targetListError, null, 2)}</pre>
                </div>
            )
        }

        let selectTargets = targets?.map((target) => {
            return {
                value: target.dbid,
                label: target.name
            }
        })

        return (
            <>
                {selectTargets ?
                    <Select
                        label={"Observation target: "}
                        placeholder={"pick one"}
                        searchable
                        data={selectTargets}
                        {...form.getInputProps('targetDBId')}
                        required
                    />
                    : null
                }
            </>
        )
    }

    function SelectObservationType() {
        return (
            <Select
                label={"Observation type: "}
                placeholder={"select observation type"}
                data = {[
                    'Target', 'Calibration'
                ]}
                {...form.getInputProps('observationType')}
            />
        )
    }

    function SelectCalibrationUse()
    {
        //maxDropDownHeight: limits scrollable height < the modal height
        //otherwise dropdown gets clipped (may want to rethink the hardcoded value)
        return (
            <Select
                label={"Calibration intended use: "}
                placeholder={"pick one"}
                //maxDropdownHeight={100}
                data = {[
                    'Amplitude',
                    'Atmospheric',
                    'Bandpass',
                    'Phase',
                    'Pointing',
                    'Focus',
                    'Polarization',
                    'Delay'
                ]}
                {...form.getInputProps('calibrationUse')}
            />
        )
    }

    function TechnicalGoalInputs() {
        return (
            <Group position={"center"}>
                <NumberInput
                    label={"Angular resolution (arcsec):"}
                    defaultValue={0.000}
                    precision={3}
                    step={0.001}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                />
                <NumberInput
                    label={"Largest scale (degrees):"}
                    defaultValue={0.000}
                    precision={3}
                    step={0.001}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                />
                <NumberInput
                    label={"Sensitivity (dB):"}
                    defaultValue={0.000}
                    precision={3}
                    step={0.001}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                />
                <NumberInput
                    label={"Dynamic range (dB):"}
                    defaultValue={0.00}
                    precision={2}
                    step={0.01}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                />
                <NumberInput
                    label={"Representative spectral point (GHz):"}
                    defaultValue={0.00}
                    precision={2}
                    step={0.01}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                />
            </Group>
        )
    }

    //As a reminder, Radio observations can be done at any time but Optical observations can occur only after sunset.
    //In both cases the target must be above the horizon.

    function SetObservationDateTime() {

        //Providing a UI for a TimingWindow: {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
        // semantics of 'isAvoidConstraint' - true means avoid this date range, false means use this date range
        // User may provide multiple "timing windows" per observation. These are stored as a List of Constraints
        // in the Observation in the backend. TimingWindows are not the only Constraints.

        //Note: using Grid and Grid.Col to get the spacing correct for each element. Using Group appears to leave
        // a significant amount of space unused

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

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Container fluid>
            <Grid grow columns={5}>
                <Grid.Col span={2}>
                    <fieldset>
                        <legend><Text>Set target and observation type</Text></legend>
                        {SelectTargets()}
                        {
                            targetsLoading ? 'loading...' :
                                <RenderTarget
                                    proposalCode={Number(selectedProposalCode)}
                                    dbid={form.values.targetDBId}
                                    showRemove={false}
                                />
                        }
                        <Space h={"xl"}/>
                        {SelectObservationType()}
                        {form.values.observationType === 'Calibration' &&
                            SelectCalibrationUse()
                        }
                    </fieldset>
                    <fieldset>
                        <legend><Text>Technical goals</Text></legend>
                        {TechnicalGoalInputs()}
                    </fieldset>
                </Grid.Col>
                <Grid.Col span={3}>
                    <fieldset>
                        <legend><Text>Timing windows</Text></legend>
                        {SetObservationDateTime()}
                        <Group position={"right"} mt={"xs"}>
                            <Button onClick={() =>
                                form.insertListItem('timingWindows', {...timingWindowInitial, key: randomId()})
                            }>
                                <IconPlus size={"1rem"}/>
                            </Button>
                        </Group>
                    </fieldset>

                    <Group position="right" mt="md">
                        <Tooltip label={"submit"}>
                            <Button type="submit">Save</Button>
                        </Tooltip>
                    </Group>
                </Grid.Col>
            </Grid>
            </Container>
        </form>
    );
}