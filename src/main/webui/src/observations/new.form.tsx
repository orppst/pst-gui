import {useForm} from "@mantine/form";
//import {useParams} from "react-router-dom";
import {useProposalResourceGetTarget, useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {Button, Group, Select, TextInput} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {CelestialTarget} from "../generated/proposalToolSchemas.ts";
import {TargetId} from "./List.tsx";
//import {CelestialTarget} from "../generated/proposalToolSchemas.ts";

export function ObservationForm (props: TargetId){

    // we need a valid form.values.targetName (aka database id) before we call the
    // useProposalResourceGetTarget hook. We get this from the 'props' passed in from calling environment


    const { selectedProposalCode} = useParams();

    const form = useForm({
        initialValues: {
            observationType:'Target',
            calibrationUse:'placeHolder',
            targetDBId: '',
            targetRA: 0,
            targetDec: 0,
            targetSpaceFrame:'placeHolder',
            targetPositionEpoch:'placeHolder',
        },

        validate: {

        },
    });

    const [targetDetails, setTargetDetails] = useState({
        ra: 0.0,
        dec: 0.0,
        epoch: 'position epoch',
        frame: 'space frame'
    });

    const {data: targetData , error: targetDetailsError} =
        useProposalResourceGetTarget(
            {
                pathParams: {
                    proposalCode: Number(selectedProposalCode),
                    targetId: form.values.targetDBId ? Number(form.values.targetDBId) : props.id!
                }
            }
        );

    useEffect( () => {

        if (targetDetailsError) {
            //probably need a better way of handling this
            setTargetDetails(prevState => {
                return {...prevState, epoch: 'not found', frame: 'not found'}
            });
        }
        else if (targetData?.["@type"] === 'proposal:CelestialTarget') {

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
    }, [form.values.targetDBId]);



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
                placeholder={"please select the observation type"}
                data = {[
                    'Calibration', 'Target'
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
                maxDropdownHeight={100}
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
            form.values.targetDBId ?
                <fieldset>
                    <legend>Target Details</legend>
                    <Group grow>
                        <TextInput
                            disabled
                            placeholder={"RA degrees"}
                            label={"Right-Ascension:"}
                            value={targetDetails.ra}
                        />
                        <TextInput
                            disabled
                            placeholder={"DEC degrees"}
                            label={"Declination:"}
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
                :
                <></>
        )
    }

    //TODO: onSubmit needs to do actual business logic to add the observation to the proposal

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>

            {SelectTargets()}

            {DisplayTargetDetails()}

            {SelectObservationType()}

            {form.values.observationType === 'Calibration' &&
                SelectCalibrationUse()
            }

            <Group position="right" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
}