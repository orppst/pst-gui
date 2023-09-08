import {useForm} from "@mantine/form";
//import {useParams} from "react-router-dom";
import {useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {Button, Group, Select, TextInput} from "@mantine/core";
import {useContext} from "react";
import {ProposalContext} from "../App2.tsx";
//import {CelestialTarget} from "../generated/proposalToolSchemas.ts";

export function ObservationForm (){
    const form = useForm({
        initialValues: {
            observationType:'Target',
            calibrationUse:'placeHolder',
            targetName: '',
            targetRA: 0,
            targetDec: 0,
            targetSpaceFrame:'placeHolder',
            targetPositionEpoch:'placeHolder',
        },

        validate: {

        },
    });

    const { selectedProposalCode} = useContext(ProposalContext);

    function SelectTargets() {

        //const { selectedProposalCode} = useParams();

        const { data: targets , error } =
            useProposalResourceGetTargets({pathParams: {proposalCode: selectedProposalCode}}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
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
                        {...form.getInputProps('targetName')}
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
        //otherwise dropdown gets clipped
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

/*        const {data , error} = useProposalResourceGetTarget(
            {
                pathParams: {
                    proposalCode: selectedProposalCode,
                    targetId: Number(form.values.targetName)
                }
            }
        );*/





        return (
            <>
                {form.values.targetName ?
                    <Group grow>
                        <TextInput
                            disabled
                            placeholder={"RA degrees"}
                            label={"Target Right-Ascension:"}
                        />

                        <TextInput
                            disabled
                            placeholder={"DEC degrees"}
                            label={"Target Declination"}
                        />
                    </Group>
                    : null
                }

            </>
        )
    }

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