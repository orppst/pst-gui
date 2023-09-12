import {useForm} from "@mantine/form";
import {useProposalResourceGetTarget, useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {Button, Checkbox, Group, Select, Space, TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {CelestialTarget} from "../generated/proposalToolSchemas.ts";
import {TargetId} from "./List.tsx";
import {DatePickerInput, TimeInput} from "@mantine/dates";

interface ObservationFormValues {
    observationType: 'Target'|'Calibration'|'';
    calibrationUse:  'Amplitude'|'Atmospheric'|'Bandpass'|'Phase'|'Pointing'|'Focus'|'Polarization'|'Delay'|'',
    targetDBId: number,
    timingWindows: {
        start: Date | null,
        end: Date | null,
        note: string,
        isAvoid: boolean
    }[]
}

export function ObservationForm (props: TargetId){

    // we need a valid form.values.targetDBId before we call the
    // useProposalResourceGetTarget hook. We get this from the 'props' passed in from calling environment

    const { selectedProposalCode} = useParams();

    const form = useForm<ObservationFormValues>({
        initialValues: {
            observationType:'',
            calibrationUse:'',
            targetDBId: props.id!,
            timingWindows: []
        },

        validate: {

        },
    });

    const {data: targetData , error: targetDetailsError, isLoading: targetLoading} =
        useProposalResourceGetTarget(
            {
                pathParams: {
                    proposalCode: Number(selectedProposalCode),
                    targetId: form.values.targetDBId
                }
            }
        );

    const [targetDetails, setTargetDetails] = useState({
        ra: 0.0,
        dec: 0.0,
        epoch: 'position epoch',
        frame: 'space frame'
    });

    useEffect( () => {

        if (targetDetailsError)
        {
            //probably need a better way of handling this
            setTargetDetails(prevState => {
                return {...prevState, epoch: 'not found', frame: 'not found'}
            });
        }
        else if (targetData?.["@type"] === 'proposal:CelestialTarget')
        {
            let source_coordinates = (targetData as CelestialTarget).sourceCoordinates;

            let ra_degrees = source_coordinates?.lat?.value!;
            let dec_degrees = source_coordinates?.lon?.value!;
            let position_epoch = (targetData as CelestialTarget).positionEpoch?.value!;
            //let coordinate_system = source_coordinates?.coordSys!;
            //FIXME: can't seem to access the SpaceFrame string so hardcoding the "default" for now
            let space_frame = 'ICRS'; //(coordinate_system as SpaceFrame).spaceRefFrame!;

            setTargetDetails({ra: ra_degrees, dec: dec_degrees, epoch: position_epoch, frame: space_frame});
        }
        //else do nothing
    }, [targetLoading, form.values.targetDBId]);



    function SelectTargets() {

        const { data: targets , error: targetListError } =
            useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)}}, {enabled: true});

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

    function DisplayTargetDetails()
    {
        //Mantine v7 includes a 'Fieldset' component
        return (
            //form.values.targetDBId ?
                <fieldset>
                    <legend>Target Details</legend>
                    <Group grow>
                        <TextInput
                            disabled
                            placeholder={"RA degrees"}
                            label={"Right-Ascension:"}
                            description={"degrees"}
                            value={targetDetails.ra}
                        />
                        <TextInput
                            disabled
                            placeholder={"DEC degrees"}
                            label={"Declination:"}
                            description={"degrees"}
                            value={targetDetails.dec}
                        />
                    </Group>
                    <Group grow>
                        <TextInput
                            disabled
                            placeholder={"epoch"}
                            label={"Position Epoch:"}
                            value={targetDetails.epoch}
                        />
                        <TextInput
                            disabled
                            placeholder={"space frame"}
                            label={"Space Frame:"}
                            value={targetDetails.frame}
                        />
                    </Group>

                </fieldset>
               // :
               // <></>
        )
    }

    //As a reminder, Radio observations can be done at any time but Optical observations can occur only after sunset.
    //In both cases the target must be above the horizon.

    function SetObservationDateTime() {

        //Providing a UI for a TimingWindow: {start: Date, end: Date, note: string, isAvoidConstraint: boolean}
        // semantics of 'isAvoidConstraint' - true means avoid this date range, false means use this date range
        // User may provide multiple "timing windows" per observation. These are stored as a List of Constraints
        // in the Observation in the backend. TimingWindows are not the only Constraints.

        const [singleDate, setSingleDate] = useState(false);
        const [isAvoid, setIsAvoid] = useState(false);


        //FIXME: this would be better if it used the DateTimePicker, in current state have to add time on to
        // first and final dates to get the correct start and end 'Date's (problem is it is not an "Input")

        return (
            <fieldset>
                <legend>Timing Window</legend>
                <DatePickerInput
                    label={"Select a date range"}
                    placeholder={"first day - final day"}
                    minDate={new Date()}
                    type={"range"}
                    allowSingleDateInRange={singleDate}
                />
                <Space h={"md"}/>
                <Checkbox
                    label={"single date as range"}
                    checked={singleDate} onChange={(event: { currentTarget: { checked: boolean | ((prevState: boolean) => boolean); }; })=>{setSingleDate(event.currentTarget.checked)}}
                />
                <Space h={"md"}/>
                <Group grow>
                    <TimeInput
                        label={"Start time"}
                        description={"on first day in range"}
                    />
                    <TimeInput
                        label={"End time"}
                        description={"on final day in range"}
                    />
                </Group>
                <Space h={"md"}/>
                <Checkbox
                    label={"avoid"}
                    description={"do not observe during the range selected"}
                    checked={isAvoid} onChange={(event: { currentTarget: { checked: boolean | ((prevState: boolean) => boolean); }; })=>setIsAvoid(event.currentTarget.checked)}
                />
            </fieldset>
        )
    }




    //TODO: onSubmit needs to do actual business logic to add the observation to the proposal

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>

            {SelectTargets()}

            {DisplayTargetDetails()}

            <Space h={"xl"}/>

            {SelectObservationType()}

            {form.values.observationType === 'Calibration' &&
                SelectCalibrationUse()
            }

            <Space h={"xl"}/>

            {SetObservationDateTime()}

            <Group position="right" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
}