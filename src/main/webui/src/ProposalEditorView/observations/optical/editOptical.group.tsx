import {ObservationProps} from "../observationPanel.tsx";
import {Telescopes, TelescopeTiming} from './telescopes'
import { Fieldset, Stack, Group, Space } from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse, Observation, Target, TargetObservation,
} from 'src/generated/proposalToolSchemas.ts';
import { useForm, UseFormReturnType } from '@mantine/form';
import {
    useObservationResourceAddNewObservation,
    useObservationResourceReplaceTargets,
    useObservationResourceReplaceTechnicalGoal,
    useProposalResourceAddNewField
} from 'src/generated/proposalToolComponents.ts';
import {FormSubmitButton} from 'src/commonButtons/save.tsx';
import CancelButton from "src/commonButtons/cancel.tsx";
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {ReactElement, SyntheticEvent, useState} from 'react';
import {notifyError, notifySuccess} from "../../../commonPanel/notifications.tsx";
import getErrorMessage from "../../../errorHandling/getErrorMessage.tsx";
import {queryKeyProposals} from "../../../queryKeyProposals.tsx";
import {DEFAULT_STRING, NO_ROW_SELECTED, ObservationType} from '../../../constants.tsx';
import {ContextualHelpButton} from "../../../commonButtons/contextualHelp.tsx";
import {
    useOpticalTelescopeResourceSaveTelescopeData,
} from '../../../util/telescopeComms';
import * as Schemas from '../../../generated/proposalToolSchemas';
import {ObservationFormValues} from "../types/ObservationFormInterface";
import {handleTargets, handleTechnicalGoals} from "../commonObservationCode";
import TargetTypeOpticalForm from "./targetTypeOptical.form";


/**
 * builds the observation edit panel.
 *
 * @param {ObservationProps} props the properties for observation.
 * @return {ReactElement} the react HTML for the observations edit panel.
 * @constructor
 */
export default
function ObservationOpticalEditGroup(props: ObservationProps): ReactElement {

    const { selectedProposalCode } = useParams();
    const queryClient = useQueryClient();

    const [fieldName, setFieldName] = useState<string>("");

    //mutation hooks
    const addNewField =
        useProposalResourceAddNewField();
    const addNewObservation =
        useObservationResourceAddNewObservation();
    const replaceTargets =
        useObservationResourceReplaceTargets();
    const replaceTechnicalGoal =
        useObservationResourceReplaceTechnicalGoal();
    const saveTelescopeData =
        useOpticalTelescopeResourceSaveTelescopeData();

    // figures out if we have an observation.
    const newObservation = props.observation === undefined;

    // figure out the current observation type.
    const observationType: ObservationType = newObservation ? '' :
        props.observation!["@type"]
        === 'proposal:TargetObservation' ? 'Target': 'Calibration';

    // figure out the current calibration use.
    const calibrationUse: CalibrationTargetIntendedUse | undefined =
        observationType === 'Calibration' ?
            (props.observation as CalibrationObservation).intent! : undefined;

    const initialTargetIds: number [] = [];
    if (!newObservation) {
        props.observation?.target?.map(t => {
            initialTargetIds.push(t._id!)
        })
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
                observationId: props.observation?._id,
                observationType: observationType,
                targetDBIds: initialTargetIds,
                techGoalId:
                    props.observation?.technicalGoal?._id ?? NO_ROW_SELECTED,
                timingWindows: [],
                calibrationUse: calibrationUse,
                telescopeName: DEFAULT_STRING,
                instrument: DEFAULT_STRING,
                telescopeTime: {
                    value: DEFAULT_STRING,
                    unit: DEFAULT_STRING
                },
                userType: DEFAULT_STRING,
                elements: new Map<string, string>(),
            },

            validate: {
                targetDBIds: (value: number[] ) =>
                    (value.length == 0 ?
                        'Please select at least one target' : null),
                techGoalId: (value: number) =>
                    (value === NO_ROW_SELECTED ?
                        'Please select a technical goal' : null),
                observationType: (value: ObservationType) =>
                    (value === '' ?
                        'Please select the observation type' : null),
                telescopeName: (value: string) => (
                    value == DEFAULT_STRING ?
                        "Please select a telescope": null),
                instrument: (value: string) => (
                    value == DEFAULT_STRING ?
                        "Please select a instrument": null),
                userType: (value: string) => (
                    value == DEFAULT_STRING ?
                        "Please select a user type": null),
                telescopeTime: {
                    value: (value: string) => (
                        value == DEFAULT_STRING ?
                            "Please enter a time value" : null),
                    unit: (value: string) => (
                        value == DEFAULT_STRING ?
                            "Please enter a time unit" : null),
                }
            }
        });

    /**
     * handles submitting of the form.
     */
    const handleSubmit =
        form.onSubmit((values: ObservationFormValues) => {
            if (newObservation) {
                //Creating new observation
                const targetList: Target[] = [];

                values.targetDBIds.map((thisTarget) => {
                    targetList.push({
                        "@type": "proposal:CelestialTarget",
                        "_id": thisTarget
                    })
                })

                //we need to persist an observation field which the new
                // observation then references
                addNewField.mutateAsync({
                    pathParams: {
                        proposalCode: Number(selectedProposalCode)
                    },
                    body: {
                        name: fieldName,
                        "@type": "proposal:TargetField"
                    }
                }) .then( data => {
                    const baseObservation : Observation = {
                        target: targetList,
                        technicalGoal: {
                            "_id": values.techGoalId
                        },
                        field: {
                            "@type": "proposal:TargetField",
                            "_id": data._id
                        },
                    }

                    let targetObservation =
                        baseObservation as TargetObservation;

                    targetObservation = {
                            ...targetObservation,
                            "@type": "proposal:TargetObservation"}

                    addNewObservation.mutate({
                        pathParams: {
                            proposalCode: Number(selectedProposalCode)
                        },
                        body:targetObservation,
                    }, {
                        onSuccess: (obs: Schemas.Observation) => {
                            if (obs._id !== undefined) {
                                processTelescopeData(obs._id, true);
                            }
                        },
                        onError: (error) =>
                            notifyError("Failed to add Observation",
                                        getErrorMessage(error)),
                    })
                })
                    .catch(error => {
                        notifyError("Cannot create Observation: " +
                            "Failed to add Observation Field",
                            getErrorMessage(error));
                    })
            }
            else {
                const id = props.observation?._id;
                const obsID = id!;
                if (form.isDirty('targetDBIds')) {
                    handleTargets(
                        values, replaceTargets, selectedProposalCode,
                        obsID, queryClient);
                }

                if (form.isDirty('techGoalId')) {
                    handleTechnicalGoals(
                        values, selectedProposalCode,
                        obsID, queryClient, replaceTechnicalGoal);
                }
                processTelescopeData(form.getValues().observationId!, false);
            }
    });

    /**
     * stores optical telescope stuff.
     *
     * @param {string} observationId: the observation id.
     * @param {boolean} newObs: true if new, false otherwise.
     */
    function processTelescopeData(observationId: number, newObs: boolean) {
        if(form.isDirty("telescopeName") || form.isDirty("instrument") ||
            form.isDirty("elements")) {
            saveTelescopeData.mutate({
                primaryKey: {
                    proposalID: selectedProposalCode!,
                    observationID: observationId.toString(),
                },
                instrumentName: form.getValues().instrument!,
                telescopeName: form.getValues().telescopeName!,
                telescopeTimeUnit: form.getValues().telescopeTime.unit,
                telescopeTimeValue: form.getValues().telescopeTime.value,
                userType: form.getValues().userType,
                choices: Object.fromEntries(form.getValues().elements.entries())
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: queryKeyProposals({
                            proposalId: Number(selectedProposalCode),
                            childName: "observations",
                            childId: observationId
                        }),
                    }).then(() => {
                        if (!newObs) {
                            notifySuccess("Telescopes data Updated",
                                          "telescope data saved")
                            queryClient.invalidateQueries().then();
                            props.closeModal!();
                        } else {
                            queryClient.invalidateQueries().then();
                            notifySuccess("Observation Added",
                                          "new observation added to proposal")
                            props.closeModal!();
                        }
                    });
                },
                onError: (error) =>
                    notifyError("Failed to update optical telescope data",
                        getErrorMessage(error)),
            });
        }
    }

    /**
     * handle cancelling of the form.
     * @param event: the event.
     */
  function handleCancel(event: SyntheticEvent) {
      event.preventDefault();
      props.closeModal!();
  }

  return (
    <form onSubmit={handleSubmit}>
        <Stack>
            <ContextualHelpButton messageId={"MaintObs"} />
            <TargetTypeOpticalForm form={form} setFieldName={setFieldName}/>
            <Space h={"md"} />
            <Fieldset legend={"Optical Telescopes"}>
                <Telescopes form={form}/>
            </Fieldset>
            <Fieldset legend={"Timing"}>
                <TelescopeTiming form={form}/>
            </Fieldset>
            <Group justify={"flex-end"}>
                <FormSubmitButton form={form}/>
                <CancelButton
                    onClickEvent={handleCancel}
                    toolTipLabel={"Go back without saving"}
                />
            </Group>
        </Stack>
    </form>
    )
}