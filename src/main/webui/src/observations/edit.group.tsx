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
import { FormEvent, ReactElement, useEffect } from 'react';
import { randomId } from '@mantine/hooks';
import { TimingWindowGui } from './timingWindowGui.tsx';

/**
 * the different types of observation.
 * TODO check if this can be a enum somewhere instead.
 */
type ObservationType = 'Target' | 'Calibration' | '';

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
export default function ObservationEditGroup(
    props: ObservationProps): ReactElement {

    /*
    For the TimingWindowForm the timingWindows array/list parameter should
    only contain 'TimingWindow' types rather than the generic 'Constraint',
    the class from which it inherits in Java. Issue being that the containing
    object, the 'observation', only has an array of 'Constraints'. We either
    separate the 'Constraints' based on their subtypes here, or have a
    'TimingWindow' specific API call that returns the desired list via a hook.
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
    let calibrationUse : CalibrationTargetIntendedUse | undefined =
        observationType === 'Calibration' ?
        (props.observation as CalibrationObservation).intent! : undefined;

    // figure out the current timing windows, ensures that the array is
    // not undefined.
    let initialTimingWindows: TimingWindowGui[] = [];
    if (props && props.observation?.constraints?.length != undefined &&
            props.observation?.constraints?.length > 0) {
        initialTimingWindows =
            props.observation?.constraints?.map<TimingWindowGui>(
                (timingWindow) => {
                    return ConvertToTimingWindowGui(timingWindow);
        });
    }

    /**
     * builds the form for the united form.
     *
     * @type {UseFormReturnType<ObservationFormValues>} the form values
     * for the entire panel.
     */
    const form: UseFormReturnType<ObservationFormValues> =
        useForm<ObservationFormValues>({
            initialValues: {
                observationType: observationType,
                calibrationUse: calibrationUse,
                targetDBId: props.observation?.target?._id,
                techGoalId: props.observation?.technicalGoal?._id,
                fieldId: 1, //FIXME: need a user selected value
                timingWindows: initialTimingWindows
            },

            validate: {
                targetDBId: (value: number | undefined | string ) =>
                    (value === undefined ?
                        'Please select a target' : null),
                techGoalId: (value: number | undefined | string) =>
                    (value === undefined ?
                        'Please select a technical goal' : null),
                observationType: (value: ObservationType) =>
                    (value === '' ?
                        'Please select the observation type' : null),
                calibrationUse: (value, values) =>
                    ((values.observationType === "Calibration" &&
                        value === undefined) ?
                        'Please select the calibration use' : null),
                timingWindows: {
                    startTime: (value) => (
                        value === null ? 'No start time selected' : null),
                    endTime: (value) => (
                        value === null ? 'No end time selected' : null)
                }
            },
    });

    /**
     * force the validation to engage once the UI has been rendered.
     */
    useEffect(() => {
        form.errors = form.validate().errors;
    })

    /**
     * handles the saving of the entire form to the database.
     *
     * @type {(event?: React.FormEvent<HTMLFormElement>) => void} handles
     * saving the entire form.
     */
    const handleSubmit: (event?: FormEvent<HTMLFormElement>) => void =
        form.onSubmit((values) => {
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

                let targetObservation =
                    baseObservation as TargetObservation;

                let calibrationObservation =
                    baseObservation as CalibrationObservation;


                if (values.observationType == 'Calibration') {
                    calibrationObservation = {
                        ...calibrationObservation,
                        "@type": "proposal:CalibrationObservation",
                        intent: values.calibrationUse}
                } else {
                    targetObservation = {
                        ...targetObservation,
                        "@type": "proposal:TargetObservation"}
                }

                console.log(JSON.stringify(baseObservation));

                fetchObservationResourceAddNewObservation({
                    pathParams:{proposalCode: Number(selectedProposalCode)},
                    body: values.observationType == 'Target' ?
                        targetObservation : calibrationObservation
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
            <form onSubmit={handleSubmit}>
                <Group justify={'flex-start'} mt="md">
                    <SubmitButton toolTipLabel={
                        hasObservation ? "save changes" : "save"}/>
                </Group>
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


//Type TimingWindow in proposalToolSchemas.ts has 'startTime' and
// 'endTime' as date strings (ISO8601 strings).
//We need to convert these to type Date before using them with the
// 'DateTimePicker' element

function ConvertToTimingWindowGui(input: TimingWindow) : TimingWindowGui {
    return ({
        startTime: new Date(input.startTime!),
        endTime: new Date(input.endTime!),
        note: input.note!,
        isAvoidConstraint: input.isAvoidConstraint!,
        key: randomId()
    })
}

/**
 * left as im sure this will be useful once we decide how to save
 *
 * // Note: API expects the Dates as the number of seconds since the posix epoch
 * // @ts-ignore
 * function ConvertToTimingWindowApi(input: TimingWindowGui) : TimingWindowApi {
 *     return ({
 *         "@type": "proposal:TimingWindow",
 *         startTime: input.startTime!.getTime(),
 *         endTime: input.endTime!.getTime(),
 *         note: input.note,
 *         isAvoidConstraint: input.isAvoidConstraint
 *     })
 * }
 *
 *
 *
 * //type to use to pass data to the API
 * type TimingWindowApi = {
 *     "@type": string,
 *     startTime: number,
 *     endTime: number,
 *     note: string,
 *     isAvoidConstraint: boolean,
 * }
 *
 *
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