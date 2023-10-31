import {Group, Stack, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {PerformanceParameters, RealQuantity, TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import {SubmitButton} from "../commonButtons/save.tsx";
import {angularUnits, frequencyUnits, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit} from "../commonInputs/NumberInputPlusUnit.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useParams} from "react-router-dom";
import {fetchProposalResourceAddNewTechnicalGoal} from "../generated/proposalToolComponents.ts";


/*
    When creating new Performance Parameters at least one of the parameters must be fully
    specified i.e., have a numeric value and a unit name. Other parameters can be left
    blank/null/undefined. It may turn out that on Proposal Submission some of these
    parameters need filling out. In which case, this is a task for the Proposal validation
    function, whatever that entails.
 */


/**
 * interface for what's within a PerformanceParameters.
 */
interface PerformanceValues {
    angularResolution: RealQuantity,
    largestScale: RealQuantity,
    sensitivity: RealQuantity,
    dynamicRange: RealQuantity,
    spectralPoint: RealQuantity
}

/**
 * entry function for building the performance parameters page.
 * @param {{performance?: PerformanceParameters, newTechnicalGoal: boolean, closeModal?: () => void}} props
 * input data that contains the performance parameters to display,
 * a boolean which states if it is a new technical goal or not,
 * and an optional close method.
 * @return {JSX.Element} the generated HTML for the performance form.
 * @constructor
 */
export default function PerformanceParametersForm(
    props: {performance?: PerformanceParameters, newTechnicalGoal: boolean, closeModal?: ()=>void}
)
{

    const queryClient = useQueryClient();

    const { selectedProposalCode} = useParams();

    let initialPerformanceValues : PerformanceValues = {
        angularResolution: props.performance?.desiredAngularResolution ?
            props.performance.desiredAngularResolution : {value: undefined, unit: {value: ""}},
        largestScale: props.performance?.desiredLargestScale ?
            props.performance.desiredLargestScale : {value: undefined, unit: {value: ""}},
        sensitivity: props.performance?.desiredSensitivity ?
            props.performance.desiredSensitivity : {value: undefined, unit: {value: ""}},
        dynamicRange: props.performance?.desiredDynamicRange ?
            props.performance.desiredDynamicRange : {value: undefined, unit: {value: ""}},
        spectralPoint: props.performance?.representativeSpectralPoint ?
            props.performance.representativeSpectralPoint : {value: undefined, unit: {value: ""}},
    }

    const form = useForm<PerformanceValues>({
        initialValues: initialPerformanceValues,
        validate: {
            //theNumber: check that if a unit has been selected the numeric component isn't blank
            //theUnit: ensure that if the parameter has a numeric value it also has a unit name
            angularResolution:{
                value: (theNumber, formValues) => (
                    formValues.angularResolution.unit?.value !== "" && theNumber === undefined ?
                        "Unit selected but no value given" : null
                ),
                unit: {
                    value: (theUnit, formValues) => (
                        formValues.angularResolution.value !== undefined && theUnit === "" ?
                            'Please pick a unit' : null
                    )
                }
            },
            largestScale:{
                value: (theNumber, formValues) => (
                    formValues.largestScale.unit?.value !== "" && theNumber === undefined ?
                        "Unit selected but no value given" : null
                ),
                unit: {
                    value: (theUnit, formValues) => (
                        formValues.largestScale.value !== undefined && theUnit === "" ?
                            'Please pick a unit' : null
                    )
                }
            },
            sensitivity:{
                value: (theNumber, formValues) => (
                    formValues.sensitivity.unit?.value !== "" && theNumber === undefined ?
                        "Unit selected but no value given" : null
                ),
                unit: {
                    value: (theUnit, formValues) => (
                        formValues.sensitivity.value !== undefined && theUnit === "" ?
                            'Please pick a unit' : null
                    )
                }
            },
            dynamicRange:{
                value: (theNumber, formValues) => (
                    formValues.dynamicRange.unit?.value !== "" && theNumber === undefined ?
                        "Unit selected but no value given" : null
                ),
                unit: {
                    value: (theUnit, formValues) => (
                        formValues.dynamicRange.value !== undefined && theUnit === "" ?
                            'Please pick a unit' : null
                    )
                }
            },
            spectralPoint:{
                value: (theNumber, formValues) => (
                    formValues.spectralPoint.unit?.value !== "" && theNumber === undefined ?
                        "Unit selected but no value given" : null
                ),
                unit: {
                    value: (theUnit, formValues) => (
                        formValues.spectralPoint.value !== undefined && theUnit === "" ?
                            'Please pick a unit' : null
                    )
                }
            },
        },
        
        transformValues: (values) => ({
            angularResolution: {
                "@type": "ivoa:RealQuantity", 
                value: values.angularResolution.value,
                unit: {value: values.angularResolution.unit?.value}
            },
            largestScale: {
                "@type": "ivoa:RealQuantity",
                value: values.largestScale.value,
                unit: {value: values.largestScale.unit?.value}
            },
            sensitivity: {
                "@type": "ivoa:RealQuantity",
                value: values.sensitivity.value,
                unit: {value: values.sensitivity.unit?.value}
            },
            dynamicRange: {
                "@type": "ivoa:RealQuantity",
                value: values.dynamicRange.value,
                unit: {value: values.dynamicRange.unit?.value}
            },
            spectralPoint: {
                "@type": "ivoa:RealQuantity",
                value: values.spectralPoint.value,
                unit: {value: values.spectralPoint.unit?.value}
            },
        })
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

    const handleSubmit = form.onSubmit( (values) => {
        form.validate();
        if (props.newTechnicalGoal)
        {
            //posting a new technical goal to the DB

            let performanceParameters : PerformanceParameters = {
                desiredAngularResolution: values.angularResolution,
                desiredDynamicRange: values.dynamicRange,
                desiredSensitivity: values.sensitivity,
                desiredLargestScale: values.largestScale,
                representativeSpectralPoint: values.spectralPoint
            }

            let goal : TechnicalGoal = {
                performance: performanceParameters,
                spectrum: []
            }

            fetchProposalResourceAddNewTechnicalGoal( {
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: goal
            })
                .then(()=>queryClient.invalidateQueries())
                .then(()=>props.closeModal!())
                .catch(console.error);

        } else
        {
            //editing an existing technical goal
            alert("editing a technical goal is not yet implemented")
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