import TargetTypeForm from "./targetType.form.tsx";
import TimingWindowsForm from "./timingWindows.form.tsx";
import {ObservationProps} from "./observationPanel.tsx";
import { Fieldset, Grid, Text, Stack, Space } from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse, Observation, Target, TargetObservation,
    TimingWindow
} from 'src/generated/proposalToolSchemas.ts';
import { useForm, UseFormReturnType } from '@mantine/form';
import {
    fetchObservationResourceAddNewConstraint,
    fetchObservationResourceAddNewObservation, fetchObservationResourceReplaceField,
    fetchObservationResourceReplaceTargets, fetchObservationResourceReplaceTechnicalGoal,
    fetchObservationResourceReplaceTimingWindow
} from 'src/generated/proposalToolComponents.ts';
import {FormSubmitButton} from 'src/commonButtons/save.tsx';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, ReactElement } from 'react';
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
    observationId: number | undefined,
    observationType: ObservationType,
    calibrationUse: CalibrationTargetIntendedUse | undefined,
    targetDBId: number[] | undefined,
    techGoalId: number | undefined,
    fieldId: string | undefined, //string for Select to show existing value in edit-form
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
    const newObservation = props.observation === undefined;

    // figure out the current observation type.
    let observationType : ObservationType = newObservation ? '' :
        props.observation!["@type"]
        === 'proposal:TargetObservation' ? 'Target': 'Calibration';

    // figure out the current calibration use.
    let calibrationUse : CalibrationTargetIntendedUse | undefined =
        observationType === 'Calibration' ?
        (props.observation as CalibrationObservation).intent! : undefined;

    // figure out the current timing windows, ensures that the array is
    // not undefined.
    let initialTimingWindows: TimingWindowGui[] = [];
    if (props && props.observation?.constraints?.length != undefined &&
            props.observation?.constraints?.length > 0) {
        // developer warning: currently the only type of 'constraint' we are using
        // is a 'TimingWindow' constraint but there are potentially other types of
        // constraint i.e., the 'timingWindow' may not be a 'TimingWindow' type.
        initialTimingWindows =
            props.observation?.constraints?.map<TimingWindowGui>(
                (timingWindow: TimingWindow) => ConvertToTimingWindowGui(timingWindow));
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
                observationId: props.observation?._id, //required for deletion of timing windows
                observationType: observationType,
                calibrationUse: calibrationUse,
                targetDBId: props.observation?.target! as number[],
                techGoalId: props.observation?.technicalGoal?._id,
                fieldId: props.observation?.field?._id ? String(props.observation?.field?._id) : undefined,
                timingWindows: initialTimingWindows
            },

            validate: {
 //               targetDBId: (value: number | undefined | string ) =>
 //                   (value === undefined ? 'Please select a target' : null),
                techGoalId: (value: number | undefined | string) =>
                    (value === undefined ? 'Please select a technical goal' : null),
                fieldId: (value: string | undefined) =>
                    (value === undefined ? 'Please select a field' : null),
                observationType: (value: ObservationType) =>
                    (value === '' ? 'Please select the observation type' : null),
                calibrationUse: (value, values) =>
                    ((values.observationType === "Calibration" && value === undefined) ?
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
     * handles the saving of the entire form to the database.
     *
     * @type {(event?: React.FormEvent<HTMLFormElement>) => void} handles
     * saving the entire form.
     */
    const handleSubmit: (event?: FormEvent<HTMLFormElement>) => void =
        form.onSubmit((values) => {
            if (newObservation) {
                //Creating new observation
                let targetList: Target[] = [];

                form.values.targetDBId?.map((thisTarget) =>{
                    targetList.push({
                        "@type": "proposal:CelestialTarget",
                        "_id": thisTarget
                    })
                })

                let baseObservation : Observation = {
                    target: targetList,
                    technicalGoal: {
                        "_id": values.techGoalId
                    },
                    field: {
                        "@type": "proposal:TargetField",
                        "_id": Number(values.fieldId)
                    },
                    constraints: values.timingWindows.map(
                        (windowGui) => {
                            return ConvertToTimingWindowApi(windowGui);
                    })
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

                fetchObservationResourceAddNewObservation({
                    pathParams:{proposalCode: Number(selectedProposalCode)},
                    body: values.observationType == 'Target' ?
                        targetObservation : calibrationObservation
                })
                    .then(()=>queryClient.invalidateQueries())
                    .then(()=>props.closeModal!())
                    .catch(console.error);

            }
            else {
                //Editing an existing observation
                form.values.timingWindows.map((tw, index) => {
                    if (tw.id === 0) {
                        //new timing window - add to the Observation
                        fetchObservationResourceAddNewConstraint({
                            pathParams: {
                                proposalCode: Number(selectedProposalCode),
                                observationId: props.observation?._id!,
                            },
                            body: ConvertToTimingWindowApi(tw)
                        })
                            .then(()=>queryClient.invalidateQueries())
                            .catch(console.error)

                    } else if (form.isDirty(`timingWindows.${index}`)){
                        //existing timing window and modified - update in Observation

                        //the ts-ignore is required due to the fetch expecting a TimingWindow type
                        //with start and end times as ISO-strings but the API excepting only the
                        //number of milliseconds since the posix epoch
                        fetchObservationResourceReplaceTimingWindow({
                            pathParams: {
                                proposalCode: Number(selectedProposalCode),
                                observationId: props.observation?._id!,
                                timingWindowId: tw.id
                            },
                            // @ts-ignore
                            body: ConvertToTimingWindowApi(tw)
                        })
                            .then(()=>queryClient.invalidateQueries())
                            .catch(console.error)
                    }
                    //else do nothing
                })

                if (form.isDirty('targetDBId')) {
                    let body: Target[] = [];

                    form.values.targetDBId?.map((thisTarget) =>{
                        body.push({
                            "@type": "proposal:CelestialTarget",
                            "_id": thisTarget
                        })
                    })

                    console.log("BODY: " + JSON.stringify(body, null, 2));

                    fetchObservationResourceReplaceTargets({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!
                        },
                        body: body
                    })
                        .then(()=>queryClient.invalidateQueries())
                        .catch(console.error)
                }

                if (form.isDirty('techGoalId')) {
                    fetchObservationResourceReplaceTechnicalGoal({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!
                        },
                        body: {
                            "_id": form.values.techGoalId
                        }
                    })
                        .then(()=>queryClient.invalidateQueries())
                        .catch(console.error)
                }

                if (form.isDirty('fieldId')) {
                    fetchObservationResourceReplaceField({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!
                        },
                        body: {
                            "_id": Number(form.values.fieldId)
                        }
                    })
                        .then(()=>queryClient.invalidateQueries())
                        .catch(console.error)
                }
            }
    });

    return (
        <>
            <form onSubmit={handleSubmit}>
            <Stack>
                <Grid  columns={5}>
                    <Grid.Col span={{base: 5, lg: 2}}>
                        <Fieldset legend={"Target and type"}>
                            <TargetTypeForm {...form} />
                        </Fieldset>
                    </Grid.Col>
                    <Grid.Col span={{base: 5, lg: 3}}>
                        <Fieldset legend={"Timing windows"}>
                            <Text ta={"center"}  size={"xs"} c={"gray.6"}>
                                Timezone set to UTC
                            </Text>
                            <TimingWindowsForm {...form}/>
                        </Fieldset>
                    </Grid.Col>
                </Grid>
                <FormSubmitButton form={form} />
                <Space />
                </Stack>
            </form>
        </>
    )
}

/**
 * Convert the TimingWindow type from the database to a type appropriate for
 * the UI.
 * NOTE: This is because the Type TimingWindow in proposalToolSchemas.ts has
 * 'startTime' and 'endTime' as date strings (ISO8601 strings). We need
 * to convert these to type Date before using them with the 'DateTimePicker'
 * element.
 *
 * @param {TimingWindow} input the timing window to convert to a timing window
 * gui.
 * @return {TimingWindowGui} the converted timing window gui object.
 */
function ConvertToTimingWindowGui(input: TimingWindow) : TimingWindowGui {
    return ({
        startTime: new Date(input.startTime!),
        endTime: new Date(input.endTime!),
        note: input.note!,
        isAvoidConstraint: input.isAvoidConstraint!,
        key: String(input._id!),
        id: input._id!
    })
}

/**
 * Convert the TimingWindowGui type to a type appropriate to write to the
 * database.
 * Note: API expects the Dates as the number of milliseconds since the posix epoch
 *
 * @param {TimingWindowGui} input the timing window gui to convert to a
 * timing window api.
 * @return {TimingWindowApi} the converted timing window API object.
 */
function ConvertToTimingWindowApi(input: TimingWindowGui) : TimingWindowApi {
    return ({
        "@type": "proposal:TimingWindow",
        startTime: input.startTime!.getTime(),
        endTime: input.endTime!.getTime(),
        note: input.note,
        isAvoidConstraint: input.isAvoidConstraint,
        _id: input.id
    })
}

