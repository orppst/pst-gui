import TargetTypeForm from "./targetType.form.tsx";
import TimingWindowsForm from "./timingWindows.form.tsx";
import {ObservationProps} from "./observationPanel.tsx";
import { Fieldset, Grid, Group } from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse, Observation, TargetObservation,
    TimingWindow
} from '../generated/proposalToolSchemas.ts';
import { useForm, UseFormReturnType } from '@mantine/form';
import { fetchObservationResourceAddNewObservation } from '../generated/proposalToolComponents.ts';
import { SubmitButton } from '../commonButtons/save.tsx';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { randomId } from '@mantine/hooks';
import { TimingWindowGui } from './timingWindowGui.tsx';

/**
 * the different types of observation.
 * TODO check if this can be a enum somewhere instead.
 */
type ObservationType = 'Target'|'Calibration'|'';

/**
 * the interface for the timing windows.
 */
export interface TimingWindows {
    observationId?: number,
    timingWindows: TimingWindow [] //do you ever feel like you might be running, head first, into naming problems?
}

/**
 * the interface for the entire observation form.
 */
export interface ObservationFormValues {
    observationType: ObservationType;
    calibrationUse: CalibrationTargetIntendedUse | undefined,
    targetDBId: number | undefined,
    techGoalId: number | undefined,
    fieldId: number | undefined
    timingWindows: TimingWindowGui[],
}

/**
 * builds the observation edit panel.
 *
 * @param {ObservationProps} props the properties for observation.
 * @return {ReactElement} the react HTML for the observations edit panel.
 * @constructor
 */
export default function ObservationEditGroup(props: ObservationProps): ReactElement {

    /*
    For the TimingWindowForm the timingWindows array/list parameter should only contain 'TimingWindow'
    types rather than the generic 'Constraint', the class from which it inherits in Java. Issue being
    that the containing object, the 'observation', only has an array of 'Constraints'. We either
    separate the 'Constraints' based on their subtypes here, or have a 'TimingWindow' specific API call
    that returns the desired list via a hook.
     */
    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    // figures out if we have an observation.
    const hasObservation = props.observation !== undefined;

    // figure out the current observation type.
    let observationType : ObservationType = hasObservation ?
        props.observation!["@type"]
        === 'proposal:TargetObservation' ? 'Target': 'Calibration' :
        '';

    // figure out the current calibration use.
    let calibrationUse : CalibrationTargetIntendedUse | undefined = observationType === 'Calibration' ?
        (props.observation as CalibrationObservation).intent! : undefined;

    // figure out the current timing windows
    let initialTimingWindows = props && props.observation.constraints.length > 0 ?
        props.timingWindows.map((timingWindow) => {
            return ConvertToTimingWindowGui(timingWindow);}) :
        [emptyTimingWindow];

    const form: UseFormReturnType<ObservationFormValues> = useForm<ObservationFormValues>({
        initialValues: {
            observationType: observationType,
            calibrationUse: calibrationUse,
            targetDBId: props.observation?.target?._id,
            techGoalId: props.observation?.technicalGoal?._id,
            fieldId: 1, //FIXME: need a user selected value
            timingWindows: {
                observationId: props.observationId,
                timingWindows: initialTimingWindows,
            }
        },

        validate: {
            targetDBId: (value) =>
                (value === undefined ?
                    'Please select a target' : null),
            observationType: (value) =>
                (value === '' ?
                    'Please select the observation type' : null),
            calibrationUse: (value, values) =>
                ((values.observationType === "Calibration" &&
                    value === undefined) ?
                    'Please select the calibration use' : null),
            timingWindows: {
                //TODO: we should check that startTime < endTime - may need to be done in 'handleSave'
                timingWindows: {
                    startTime: (value) => (value === null ? 'No start time selected' : null),
                    endTime: (value) => (value === null ? 'No end time selected' : null)
                }
            }
        },
    });

    const handleSubmit = form.onSubmit( (values) => {

        if (props.newObservation) {
            console.log("Creating");

            let baseObservation : Observation = {
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

            let targetObservation = baseObservation as TargetObservation;

            let calibrationObservation = baseObservation as CalibrationObservation;


            if (values.observationType == 'Calibration') {
                calibrationObservation = {...calibrationObservation,"@type": "proposal:CalibrationObservation", intent: values.calibrationUse}
            } else {
                targetObservation = {...targetObservation, "@type": "proposal:TargetObservation"}
            }

            console.log(JSON.stringify(baseObservation));

            fetchObservationResourceAddNewObservation({
                pathParams:{proposalCode: Number(selectedProposalCode)},
                body: values.observationType == 'Target' ? targetObservation : calibrationObservation
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
        <>
            <Group justify={'flex-end'} mt="md">
                <SubmitButton toolTipLabel={hasObservation ? "save changes" : "save"}/>
            </Group>
            <form onSubmit={handleSubmit}>
                <Grid  columns={5}>
                    <Grid.Col span={{base: 5, lg: 2}}>
                        <Fieldset legend={"Target and type"}>
                            <TargetTypeForm {...form} />
                        </Fieldset>
                    </Grid.Col>
                    <Grid.Col span={{base: 5, lg: 3}}>
                        <Fieldset legend={"Timing windows"}>
                            <TimingWindowsForm {...form}/>
                        </Fieldset>
                    </Grid.Col>
                </Grid>
            </form>
        </>
    )
}

/*
        Type TimingWindow in proposalToolSchemas.ts has 'startTime' and 'endTime' as date strings (ISO8601 strings).
        We need to convert these to type Date before using them with the 'DateTimePicker' element
     */
function ConvertToTimingWindowGui(input: TimingWindow) : TimingWindowGui {
    return ({
        startTime: new Date(input.startTime!),
        endTime: new Date(input.endTime!),
        note: input.note!,
        isAvoidConstraint: input.isAvoidConstraint!,
        key: randomId()
    })
}

/*
 Note: API expects the Dates as the number of seconds since the posix epoch
 */
// @ts-ignore
function ConvertToTimingWindowApi(input: TimingWindowGui) : TimingWindowApi {
    return ({
        "@type": "proposal:TimingWindow",
        startTime: input.startTime!.getTime(),
        endTime: input.endTime!.getTime(),
        note: input.note,
        isAvoidConstraint: input.isAvoidConstraint
    })
}


/**
 *  const handleSave = (timingWindow : TimingWindowApi) => {
 *         console.log(timingWindow)
 *
 *         fetchObservationResourceAddNewConstraint({
 *             pathParams: {
 *                 proposalCode: Number(selectedProposalCode),
 *                 observationId: form.values.timingWindows.observationId},
 *             body: timingWindow
 *         })
 *             .then(() => queryClient.invalidateQueries())
 *             .then(() => {
 *                 notifications.show({
 *                     autoClose: false,
 *                     title: "Timing Window Saved",
 *                     message: 'The timing window has saved successfully',
 *                     color: "green"
 *                 })
 *             })
 *             .catch(console.error)
 *     }
 */