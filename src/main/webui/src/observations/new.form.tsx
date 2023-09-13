import {useForm} from "@mantine/form";
import {useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {
    ActionIcon,
    Button,
    Grid,
    Group,
    Select,
    Space,
    Switch,
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

    //As a reminder, Radio observations can be done at any time but Optical observations can occur only after sunset.
    //In both cases the target must be above the horizon.

    function SetObservationDateTime() {

        //Providing a UI for a TimingWindow: {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
        // semantics of 'isAvoidConstraint' - true means avoid this date range, false means use this date range
        // User may provide multiple "timing windows" per observation. These are stored as a List of Constraints
        // in the Observation in the backend. TimingWindows are not the only Constraints.

        const targetsAdded = form.values.timingWindows.map((item, index) => (
        <Group key={item.key} mt={"xs"}>
            <DateTimePicker
                label={"Start"}
                placeholder={"pick a start time"}
                allowDeselect
                minDate={new Date()}
                {...form.getInputProps(`timingWindows.${index}.start`)}
            />
            <DateTimePicker
                label={"End"}
                placeholder={"pick an end time"}
                minDate={new Date()}
                {...form.getInputProps(`timingWindows.${index}.end`)}
            />
            <Switch
                mt={25}
                label={"Avoid dates"}
                {...form.getInputProps(`timingWindows.${index}.isAvoid`, {type: 'checkbox'})}
            />
            <Textarea
                rows={2}
                mt={25}
                placeholder={"add optional note"}
                {...form.getInputProps(`timingWindows.${index}.note`)}
            />
            <ActionIcon color={"red"} onClick={() => form.removeListItem("timingWindows", index) }>
                <IconTrash size={"1rem"} />
            </ActionIcon>

        </Group>
        ));

        return (
            <Group mb={"xs"}>
                {targetsAdded}
            </Group>

            //button "add timing window" would not respond to the 'position' property of the enclosing Group
            //when nested in this function - don't know why
        )
    }


    //{//DisplayTargetDetails()// }

    //TODO: onSubmit needs to do actual business logic to add the observation to the proposal

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Grid columns={2}>
                <Grid.Col span={1}>
                    <fieldset>
                        <legend>Select target</legend>
                        {SelectTargets()}
                        {
                            targetsLoading ? 'loading...' :
                                <RenderTarget proposalCode={Number(selectedProposalCode)}  dbid={form.values.targetDBId} />
                        }
                        <Space h={"xl"}/>
                        {SelectObservationType()}
                        <Space h={"xl"}/>
                        {form.values.observationType === 'Calibration' &&
                            SelectCalibrationUse()
                        }
                    </fieldset>
                </Grid.Col>
                <Grid.Col span={1}>
                    <fieldset>
                        <legend>Timing Windows</legend>
                        {SetObservationDateTime()}
                        <Group position={"right"} mt={"xs"}>
                            <Button onClick={() =>
                                form.insertListItem('timingWindows', {...timingWindowInitial, key: randomId()})
                            }>
                                <IconPlus size={"1rem"}/> Add timing window
                            </Button>
                        </Group>
                    </fieldset>

                    <Group position="right" mt="md">
                        <Tooltip label={"submit"}>
                            <Button type="submit">Submit</Button>
                        </Tooltip>
                    </Group>
                </Grid.Col>
            </Grid>
        </form>
    );
}