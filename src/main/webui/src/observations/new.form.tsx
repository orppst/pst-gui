import {useForm} from "@mantine/form";
import {
    fetchObservationResourceAddNewObservation,
    useProposalResourceGetTargets
} from "../generated/proposalToolComponents.ts";
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
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse
} from "../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";


type ObservationType = 'Target'|'Calibration'|'';

interface ObservationFormValues {
    observationType: ObservationType;
    calibrationUse:  CalibrationTargetIntendedUse | undefined,
    targetDBId: number | undefined,
    techGoalId: number | undefined,
    fieldId: number | undefined
}

export function ObservationNewForm (props: ObservationTargetProps){

    const queryClient = useQueryClient();

    const { selectedProposalCode} = useParams();

    let hasObservation = props.observationProps !== undefined ;

    let observationType : ObservationType = hasObservation ?
        props.observationProps!.observation["@type"]
        === 'proposal:TargetObservation' ? 'Target': 'Calibration' :
        '';

    let calibrationUse : CalibrationTargetIntendedUse = observationType === 'Calibration' ?
        (props.observationProps!.observation as CalibrationObservation).intent! : 'AMPLITUDE';


    const form = useForm<ObservationFormValues>({
        initialValues: {
            observationType: observationType,
            calibrationUse: calibrationUse,
            targetDBId: props.targetId,
            techGoalId: 1, //FIXME: change to a user selected value
            fieldId: 1, //FIXME: change to a user selected value
        },

        validate: {
            targetDBId: (value) =>
                (value === undefined ? 'Please select a target' : null),
            observationType: (value) =>
                (value === '' ? 'Please select the observation type' : null),
            calibrationUse: (value, values) =>
                ((values.observationType === "Calibration" && value === undefined) ? 'Please select the calibration use' : null)
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
                value: target.dbid!.toString(),
                label: target.name!
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

    const handleSubmit = form.onSubmit( (values) => {

        if (props.newObservation) {
            console.log("Creating");

            let newObservation : CalibrationObservation = {
                "@type": "proposal:TargetObservation",
                target: {
                    "@type": "proposal:SolarSystemTarget",
                    "_id": values.targetDBId
                },
                technicalGoal: {
                    "_id": values.techGoalId
                },
                field: {
                    "@type": "proposal:TargetField",
                    "_id": values.fieldId
                }
            }

            if (values.observationType == 'Calibration') {
                newObservation = {...newObservation,"@type": "proposal:CalibrationObservation", intent: values.calibrationUse}
            }

            console.log(JSON.stringify(newObservation));

            fetchObservationResourceAddNewObservation({
                pathParams:{proposalCode: Number(selectedProposalCode)},
                body: newObservation
            })
                .then(()=>queryClient.invalidateQueries())
                .then(()=>props.closeModal!())
                .catch(console.log);

        }
        else {
            console.log("Editing");
        }
        console.log(values)
    });


    return (
        <form onSubmit={handleSubmit}>
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
                <Group justify={'flex-end'} mt="md">
                    <Tooltip label={"Save"}>
                        <ActionIcon size={"xl"} color={"indigo.5"} type="submit" variant={"subtle"}>
                            <IconDeviceFloppy size={"3rem"}/>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Container>
        </form>
    );
}