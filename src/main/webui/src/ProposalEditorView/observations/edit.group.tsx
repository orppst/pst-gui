import TargetTypeForm from "./targetType.form.tsx";
import TimingWindowsForm from "./timingWindows.form.tsx";
import {ObservationProps} from "./observationPanel.tsx";
import {Telescopes} from "./telescopes"
import { Fieldset, Grid, Text, Stack, Group, Space } from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse, Observation, Target, TargetObservation,
    TimingWindow
} from 'src/generated/proposalToolSchemas.ts';
import { useForm, UseFormReturnType } from '@mantine/form';
import {
    useObservationResourceAddNewConstraint,
    useObservationResourceAddNewObservation,
    useObservationResourceReplaceField, useObservationResourceReplaceIntendedUse,
    useObservationResourceReplaceTargets,
    useObservationResourceReplaceTechnicalGoal,
    useObservationResourceReplaceTimingWindow
} from 'src/generated/proposalToolComponents.ts';
import {FormSubmitButton} from 'src/commonButtons/save.tsx';
import CancelButton from "src/commonButtons/cancel.tsx";
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, ReactElement, SyntheticEvent } from 'react';
import { TimingWindowGui } from './timingWindowGui.tsx';
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {queryKeyProposals} from "../../queryKeyProposals.tsx";
import {
    useOpticalTelescopeResourceSaveTelescopeData,
    fetchOpticalTelescopeResourceLoadTelescopeData,
} from '../../util/telescopeComms';

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
    targetDBIds: number[] | undefined,
    techGoalId: number | undefined,
    fieldId: string | undefined, //string for Select to show existing value in edit-form
    timingWindows: TimingWindowGui[],
    telescopeName: string,
    instrument: string,
    elements: Map<string, string>,
}

/**
 * builds the observation edit panel.
 *
 * @param {ObservationProps} props the properties for observation.
 * @return {ReactElement} the react HTML for the observations edit panel.
 * @constructor
 */
export default
function ObservationEditGroup(props: ObservationProps): ReactElement {

    const { selectedProposalCode } = useParams();
    const queryClient = useQueryClient();

    //mutation hooks
    const addNewConstraint =
        useObservationResourceAddNewConstraint();
    const addNewObservation =
        useObservationResourceAddNewObservation();
    const replaceField =
        useObservationResourceReplaceField();
    const replaceTargets =
        useObservationResourceReplaceTargets();
    const replaceTechnicalGoal =
        useObservationResourceReplaceTechnicalGoal();
    const replaceTimingWindow =
        useObservationResourceReplaceTimingWindow();
    const replaceCalibrationUse =
        useObservationResourceReplaceIntendedUse();
    const saveTelescopeData =
        useOpticalTelescopeResourceSaveTelescopeData();

    fetchOpticalTelescopeResourceLoadTelescopeData({
            observationID: props.observation?._id?.toString(),
            proposalID: selectedProposalCode
    }).then((telescopeNameData: Map<string, Map<string, Map<string, string>>>) => {
        const mapForm = new Map(Object.entries(telescopeNameData));
        if(form.getInputProps("telescopeName").value == null && mapForm.size != 0) {
            form.setValues({
                "telescopeName": mapForm?.keys().next().value ? mapForm?.keys().next().value : 'None',
                "instrument": new Map(Object.entries(mapForm?.get(mapForm?.keys().next().value))).keys().next().value ?
                    new Map(Object.entries(mapForm?.get(mapForm?.keys().next().value))).keys().next().value : 'None',
            });
        }
    });

    // figures out if we have an observation.
    const newObservation = props.observation === undefined;

    // figure out the current observation type.
    const observationType: ObservationType = newObservation ? '' :
        props.observation!["@type"]
        === 'proposal:TargetObservation' ? 'Target' : 'Calibration';

    // figure out the current calibration use.
    const calibrationUse: CalibrationTargetIntendedUse | undefined =
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
                targetDBIds: props.selectedTargets, //check this is working as expected
                techGoalId: props.observation?.technicalGoal?._id,
                fieldId: props.observation?.field?._id ? String(props.observation?.field?._id) : undefined,
                timingWindows: initialTimingWindows,
                telescopeName: null,
                instrument: null,
                elements: new Map<string, string>(),
            },

            validate: {
                targetDBIds: (value: number[] | undefined) =>
                    (value === undefined || value.length == 0 ? 'Please select at least one target' : null),
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
                const targetList: Target[] = [];

                form.values.targetDBIds?.map((thisTarget) =>{
                    targetList.push({
                        "@type": "proposal:CelestialTarget",
                        "_id": thisTarget
                    })
                })

                const baseObservation : Observation = {
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

                addNewObservation.mutate({
                    pathParams: {
                        proposalCode: Number(selectedProposalCode)
                    },
                    body: values.observationType === 'Target' ?
                        targetObservation : calibrationObservation,
                }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries().then();
                        notifySuccess("Observation Added", "new observation added to proposal")
                        props.closeModal!();
                    },
                    onError: (error) =>
                        notifyError("Failed to add Observation", getErrorMessage(error)),
                })
            }
            else {
                //Editing an existing observation
                form.values.timingWindows.map((tw, index) => {
                    if (tw.id === 0) {
                        //new timing window - add to the Observation
                        addNewConstraint.mutate({
                            pathParams: {
                                proposalCode: Number(selectedProposalCode),
                                observationId: props.observation?._id!
                            },
                            body: ConvertToTimingWindowApi(tw)
                        }, {
                            onSuccess: () => {
                                queryClient.invalidateQueries({
                                    queryKey: queryKeyProposals({
                                        proposalId: Number(selectedProposalCode),
                                        childName: "observations",
                                        childId: form.getValues().observationId!
                                    }),
                                }).then(() =>
                                    notifySuccess("Timing Window Added",
                                        "new timing window added to observation")
                                );
                            } ,
                            onError: (error) =>
                                notifyError("Failed to add timing window", getErrorMessage(error)),
                        })

                    } else if (form.isDirty(`timingWindows.${index}`)){
                        //existing timing window and modified - update in Observation

                        //the ts-ignore is required due to the mutation expecting a TimingWindow type
                        //with start and end times as ISO-strings but the API excepting only the
                        //number of milliseconds since the posix epoch
                        replaceTimingWindow.mutate({
                            pathParams: {
                                proposalCode: Number(selectedProposalCode),
                                observationId: props.observation?._id!,
                                timingWindowId: tw.id
                            },
                            // @ts-ignore
                            body: ConvertToTimingWindowApi(tw)
                        }, {
                            onSuccess: () => {
                                queryClient.invalidateQueries({
                                    queryKey: queryKeyProposals({
                                        proposalId: Number(selectedProposalCode),
                                        childName: "observations",
                                        childId: form.getValues().observationId!
                                    }),
                                }).then(() =>
                                    notifySuccess("Timing Window Updated",
                                        "timing window updates saved")
                                );
                            },
                            onError: (error) =>
                                notifyError("Failed to update timing window", getErrorMessage(error)),
                        })
                    } //else do nothing
                })

                if (form.isDirty('targetDBIds')) {
                    const body: Target[] = [];

                    form.values.targetDBIds?.map((thisTarget) =>{
                        body.push({
                            "@type": "proposal:CelestialTarget",
                            "_id": thisTarget
                        })
                    })

                    replaceTargets.mutate({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!
                        },
                        body: body
                    }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: queryKeyProposals({
                                    proposalId: Number(selectedProposalCode),
                                    childName: "observations",
                                    childId: form.getValues().observationId!
                                }),
                            }).then(() =>
                                notifySuccess("Targets updated", "new targets saved")
                            );
                        },
                        onError: (error) =>
                            notifyError("Failed to update targets", getErrorMessage(error)),
                    })
                }

                if (form.isDirty('techGoalId')) {
                    replaceTechnicalGoal.mutate({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!,
                        },
                        body: {
                            "_id": form.values.techGoalId
                        }
                    }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: queryKeyProposals({
                                    proposalId: Number(selectedProposalCode),
                                    childName: "observations",
                                    childId: form.getValues().observationId!
                                }),
                            }).then(() =>
                                notifySuccess("Technical Goal Updated",
                                    "technical goal updates saved")
                            );
                        },
                        onError: (error) =>
                            notifyError("Failed to update technical goal", getErrorMessage(error)),
                    })
                }

                if (form.isDirty('fieldId')) {
                    replaceField.mutate({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!,
                        },
                        body: {
                            "_id": Number(form.values.fieldId),
                        }
                    }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: queryKeyProposals({
                                    proposalId: Number(selectedProposalCode),
                                    childName: "observations",
                                    childId: form.getValues().observationId!
                                }),
                            }).then(() =>
                                notifySuccess("Fields updated", "new field saved")
                            );
                        },
                        onError: (error) =>
                            notifyError("Failed to update field", getErrorMessage(error)),
                    })
                }

                if (form.isDirty('calibrationUse')) {
                    replaceCalibrationUse.mutate({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode),
                            observationId: props.observation?._id!
                        },
                        body: values.calibrationUse
                    }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: queryKeyProposals({
                                    proposalId: Number(selectedProposalCode),
                                    childName: "observations",
                                    childId: form.getValues().observationId!
                                }),
                            }).then(() =>
                                notifySuccess("Calibration Intended Use Updated",
                                    "calibration use saved")
                            );
                        },
                        onError: (error) =>
                            notifyError("Failed to update calibration use", getErrorMessage(error)),
                    })
                }

                if(form.isDirty("telescopeName") || form.isDirty("instrument") || form.isDirty("elements")) {
                    saveTelescopeData.mutate({
                        primaryKey: {
                            proposalID: selectedProposalCode,
                            observationID: form.getValues().observationId?.toString(),
                        },
                        instrumentName: form.getValues().instrument,
                        telescopeName: form.getValues().telescopeName,
                        choices: Object.fromEntries(form.getValues().elements.entries())
                    }, {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: queryKeyProposals({
                                    proposalId: Number(selectedProposalCode),
                                    childName: "observations",
                                    childId: form.getValues().observationId!
                                }),
                            }).then(() =>
                                notifySuccess("Telescopes data Updated",
                                    "telescope data saved")
                            );
                        },
                        onError: (error) =>
                            notifyError("Failed to update optical telescope data", getErrorMessage(error)),
                    });
                }
            }
    });

  const navigate = useNavigate();

  function handleCancel(event: SyntheticEvent) {
      event.preventDefault();
      navigate("../",{relative:"path"})
  }

  /*
    Might be worth splitting this into two forms: one for the Target(s) and type for the Observation, the
    other for the Timing Windows. Then we could split these across Tabs in the modal.
   */

  return (
    <form onSubmit={handleSubmit}>
        <ContextualHelpButton messageId="MaintObs" />
        <Stack>
            <Grid  columns={5}>
                <Grid.Col span={{base: 5, lg: 2}}>
                    <Fieldset legend={"Target and type"}>
                        <TargetTypeForm form={form} />
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={{base: 5, lg: 3}}>
                    <Fieldset legend={"Timing windows"}>
                        <Text ta={"center"}  size={"xs"} c={"gray.6"}>
                            Timezone set to UTC
                        </Text>
                        <TimingWindowsForm form={form}/>
                    </Fieldset>
                    <Space h={"md"} />
                    <Fieldset legend={"Optical Telescopes"}>
                        <Telescopes form={form}/>
                    </Fieldset>
                    <Group justify={"flex-end"}>
                        <FormSubmitButton form={form} />
                        <CancelButton
                            onClickEvent={handleCancel}
                            toolTipLabel={"Go back without saving"}
                        />
                    </Group>
                </Grid.Col>
            </Grid>
        </Stack>
    </form>
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
        note: input.note ?? "",
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

