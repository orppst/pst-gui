import {useForm} from "@mantine/form";
import {useProposalResourceGetTargets} from "../generated/proposalToolComponents.ts";
import {
    ActionIcon,
    Container,
    Group,
    Select,
    Space,
    Tooltip
} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ObservationTargetProps} from "./List.tsx";
import {RenderTarget} from "../targets/RenderTarget.tsx";
import {IconDeviceFloppy} from "@tabler/icons-react";
import {CalibrationObservation, CalibrationTargetIntendedUse} from "../generated/proposalToolSchemas.ts";


type ObservationType = 'Target'|'Calibration'|'';
type CalibrationUse = CalibrationTargetIntendedUse |'';

interface ObservationFormValues {
    observationType: ObservationType;
    calibrationUse:  CalibrationUse,
    targetDBId: number | undefined,
}

export function ObservationNewForm (props: ObservationTargetProps){

    // we need a valid form.values.targetDBId before we call the 'RenderTarget' function.
    // We get this from the 'props' passed in from calling environment

    const { selectedProposalCode} = useParams();

    let hasObservation = props.observationProps !== undefined ;

    let observationType : ObservationType = hasObservation ?
        props.observationProps!.observation["@type"]
        === 'proposal:TargetObservation' ? 'Target': 'Calibration' :
        '';

    let calibrationUse : CalibrationUse = observationType === 'Calibration' ?
        (props.observationProps!.observation as CalibrationObservation).intent! : '';


    const form = useForm<ObservationFormValues>({
        initialValues: {
            observationType: observationType,
            calibrationUse: calibrationUse,
            targetDBId: props.targetId,
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
        return (
            <Select
                label={"Calibration intended use: "}
                placeholder={"pick one"}
                maxDropdownHeight={150}
                data = {[
                    {value: 'AMPLITUDE', label: 'Amplitude'},
                    {value: 'ATMOSPHERIC', label: 'Atmospheric'},
                    {value: 'BANDPASS', label: 'Bandpass'},
                    {value: 'PHASE', label: 'Phase'},
                    {value: 'POINTING', label: 'Pointing'},
                    {value: 'FOCUS', label: 'Focus'},
                    {value: 'POLARIZATION', label: 'Polarization'},
                    {value: 'DELAY', label: 'Delay'},
                ]}
                {...form.getInputProps('calibrationUse')}
            />
        )
    }

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Container fluid>
                {SelectTargets()}
                {
                    targetsLoading ? 'loading...' : form.values.targetDBId != undefined &&
                        <RenderTarget
                            proposalCode={Number(selectedProposalCode)}
                            dbid={form.values.targetDBId!}
                            showRemove={false}
                        />
                }
                <Space h={"xl"}/>
                {SelectObservationType()}
                {form.values.observationType === 'Calibration' &&
                    SelectCalibrationUse()
                }
                <Group position="right" mt="md">
                    <Tooltip label={"Save"}>
                        <ActionIcon size={"xl"} color={"indigo.5"} type="submit">
                            <IconDeviceFloppy size={"3rem"}/>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Container>
        </form>
    );
}