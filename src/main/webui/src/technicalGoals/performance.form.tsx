import {Group, Stack, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {PerformanceParameters, TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import {SubmitButton} from "../commonButtons/save.tsx";
import {angularUnits, frequencyUnits, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit, NumberUnitType} from "../commonInputs/NumberInputPlusUnit.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useParams} from "react-router-dom";
import {
    fetchTechnicalGoalResourceAddTechnicalGoal,
    fetchTechnicalGoalResourceReplacePerformanceParameters
} from "../generated/proposalToolComponents.ts";
import {notifications} from "@mantine/notifications";

/*
    When creating new Performance Parameters the representative spectral point must be fully
    specified i.e., have a numeric value and a unit name. Other parameters can be left
    blank/null/undefined. It may turn out that on Proposal Submission some of these
    parameters need filling out. In which case, this is a task for the Proposal validation
    function, whatever that entails.
 */


/**
 * interface for what's within a PerformanceParameters.
 */
interface PerformanceValues {
    angularResolution: NumberUnitType,
    largestScale: NumberUnitType,
    sensitivity: NumberUnitType,
    dynamicRange: NumberUnitType,
    spectralPoint: NumberUnitType
}

/**
 * entry function for building the performance parameters page.
 * @param {{performance?: PerformanceParameters, technicalGoalId?: number,
 * newTechnicalGoal: boolean, closeModal?: () => void}} props
 * input data that contains the performance parameters to display,
 * a boolean which states if it is a new technical goal or not,
 * and an optional close method.
 * @return {JSX.Element} the generated HTML for the performance form.
 * @constructor
 */
export default function PerformanceParametersForm(
    props: {performance?: PerformanceParameters, technicalGoalId?: number,
        newTechnicalGoal: boolean, closeModal?: ()=>void}
)
{
    const queryClient = useQueryClient();

    const { selectedProposalCode} = useParams();

    let initialPerformanceValues : PerformanceValues = {
        angularResolution: props.performance?.desiredAngularResolution ?
            {
                value: props.performance.desiredAngularResolution.value!,
                unit: props.performance.desiredAngularResolution.unit?.value!
            } :
            {
                value: '', unit: ''
            },
        largestScale: props.performance?.desiredLargestScale ?
            {
                value: props.performance.desiredLargestScale.value!,
                unit: props.performance.desiredLargestScale.unit?.value!
            } :
            {
                value: '', unit: ''
            },
        sensitivity: props.performance?.desiredSensitivity ?
            {
                value: props.performance.desiredSensitivity.value!,
                unit: props.performance.desiredSensitivity.unit?.value!
            } :
            {
                value: '', unit: ''
            },
        dynamicRange: props.performance?.desiredDynamicRange ?
            {
                value: props.performance.desiredDynamicRange.value!,
                unit: props.performance.desiredDynamicRange.unit?.value!
            } :
            {
                value: '', unit: ''
            },
        spectralPoint: props.performance?.representativeSpectralPoint ?
            {
                value: props.performance.representativeSpectralPoint.value!,
                unit: props.performance.representativeSpectralPoint.unit?.value!
            } :
            {
                value: '', unit: ''
            }
    }

    const form = useForm<PerformanceValues>({
        initialValues: initialPerformanceValues,
        validate: {
            //theNumber: check that if a unit has been selected the numeric component isn't blank
            //theUnit: ensure that if the parameter has a numeric value it also has a unit name
            angularResolution:{
                value: (theNumber, formValues) => (
                    formValues.angularResolution.unit !== "" && theNumber === "" ?
                        "Unit selected but no value given" : null
                ),
                unit:(theUnit, formValues) => (
                    formValues.angularResolution.value !== "" && theUnit === "" ?
                        'Please pick a unit' : null
                )
            },
            largestScale:{
                value: (theNumber, formValues) => (
                    formValues.largestScale.unit !== "" && theNumber === "" ?
                        "Unit selected but no value given" : null
                ),
                unit: (theUnit, formValues) => (
                    formValues.largestScale.value !== "" && theUnit === "" ?
                        'Please pick a unit' : null
                )
            },
            sensitivity:{
                value: (theNumber, formValues) => (
                    formValues.sensitivity.unit !== "" && theNumber === "" ?
                        "Unit selected but no value given" : null
                ),
                unit: (theUnit, formValues) => (
                    formValues.sensitivity.value !== "" && theUnit === "" ?
                        'Please pick a unit' : null
                )
            },
            dynamicRange:{
                value: (theNumber, formValues) => (
                    formValues.dynamicRange.unit !== "" && theNumber === ""?
                        "Unit selected but no value given" : null
                ),
                unit: (theUnit, formValues) => (
                    formValues.dynamicRange.value !== "" && theUnit === "" ?
                        'Please pick a unit' : null
                )
            },
            //a spectral point must be given
            spectralPoint:{
                value: (theNumber) => (
                    theNumber === "" ?
                        "A representative spectral point must be given" : null
                ),
                unit:(theUnit, formValues) => (
                    formValues.spectralPoint.value !== "" && theUnit === "" ?
                        'Please pick a unit' : null
                )

            },
        },

    });

    const PerformanceDetails = () => {
        return (
            <Tooltip.Group openDelay={1000} closeDelay={200}>
                <Stack>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Angular resolution"}
                            toolTip={"desired angular resolution"}
                            valueRoot={'angularResolution'}
                            units={angularUnits}
                        />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={'Largest scale'}
                            toolTip={"desired largest scale"}
                            valueRoot={'largestScale'}
                            units={angularUnits}
                        />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Sensitivity"}
                            toolTip={"desired sensitivity"}
                            valueRoot={'sensitivity'}
                            units={sensitivityUnits} />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Dynamic range"}
                            toolTip={"desired dynamic range"}
                            valueRoot={'dynamicRange'}
                            units={sensitivityUnits}
                        />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Spectral point"}
                            toolTip={"representative spectral frequency"}
                            valueRoot={'spectralPoint'}
                            units={frequencyUnits}
                        />
                    </Group>
                </Stack>
            </Tooltip.Group>
        )
    }

    const convertToRealQuantity = (input : NumberUnitType) => {
        return {
            "@type": "ivoa:RealQuantity",
            value: input.value as number, //RealQuantity expects a number only
            unit: {
                value: input.unit
            }
        }
    }


    const handleSubmit = form.onSubmit( (values) => {

        let performanceParameters : PerformanceParameters = {
            desiredAngularResolution: convertToRealQuantity(values.angularResolution),
            desiredDynamicRange: convertToRealQuantity(values.dynamicRange),
            desiredSensitivity: convertToRealQuantity(values.sensitivity),
            desiredLargestScale: convertToRealQuantity(values.largestScale),
            representativeSpectralPoint: convertToRealQuantity(values.spectralPoint)
        }

        if (props.newTechnicalGoal)
        {
            //posting a new technical goal to the DB

            let goal : TechnicalGoal = {
                performance: performanceParameters,
                spectrum: []
            }

            fetchTechnicalGoalResourceAddTechnicalGoal( {
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: goal
            })
                .then(()=>queryClient.invalidateQueries())
                .then(()=>props.closeModal!())
                .catch(console.error);

        } else
        {
            //editing an existing technical goal

            fetchTechnicalGoalResourceReplacePerformanceParameters({
                pathParams: {
                    proposalCode: Number(selectedProposalCode),
                    technicalGoalId: props.technicalGoalId!
                },
                body: performanceParameters
            })
                .then(()=>queryClient.invalidateQueries())
                .then(() => {
                    notifications.show({
                        autoClose: false,
                        title: "Edit successful",
                        message: "performance parameters updated",
                        color: "green"
                    })
                })
                .then(() => form.resetDirty())
                .catch(console.error);
        }

    })

    return (
        <form onSubmit={handleSubmit}>
            {PerformanceDetails()}
            <Group justify={"flex-end"} mt="md">
                <SubmitButton
                    toolTipLabel={"save performance parameters"}
                    disabled={!form.isDirty()}
                />
            </Group>
        </form>
    )
}