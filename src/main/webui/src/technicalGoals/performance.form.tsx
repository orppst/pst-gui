import {Group, Stack, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {PerformanceParameters, RealQuantity, TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import SaveButton from "../commonButtons/save.tsx";
import {angularUnits, frequencyUnits, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit} from "../commonInputs/NumberInputPlusUnit.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useParams} from "react-router-dom";
import {fetchProposalResourceAddNewTechnicalGoal} from "../generated/proposalToolComponents.ts";

interface PerformanceValues {
    angularResolution: RealQuantity,
    largestScale: RealQuantity,
    sensitivity: RealQuantity,
    dynamicRange: RealQuantity,
    spectralPoint: RealQuantity
}

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
        if (props.newTechnicalGoal)
        {
            //posting a new technical goal to the DB
            console.log("Creating goal")

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

            console.log(JSON.stringify(goal));

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
            console.log("Editing goal")
        }

    })

    return (
        <form
            onSubmit={handleSubmit}
        >
            {PerformanceDetails()}
            <Group justify={"flex-end"} mt="md">
                <SaveButton toolTipLabel={"save performance parameters"} />
            </Group>
        </form>
    )
}