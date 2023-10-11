import {Group, Stack, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {PerformanceParameters, RealQuantity} from "../generated/proposalToolSchemas.ts";
import SaveButton from "../commonButtons/save.tsx";
import {angularUnits, frequencyUnits, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit} from "../commonInputs/NumberInputPlusUnit.tsx";

interface PerformanceValues {
    angularResolution: RealQuantity,
    largestScale: RealQuantity,
    sensitivity: RealQuantity,
    dynamicRange: RealQuantity,
    spectralPoint: RealQuantity
}

export default function PerformanceParametersForm(performance: PerformanceParameters) {

    let initialPerformanceValues : PerformanceValues = {
        angularResolution: performance.desiredAngularResolution ?
            performance.desiredAngularResolution : {value: undefined, unit: {value: ""}},
        largestScale: performance.desiredLargestScale ?
            performance.desiredLargestScale : {value: undefined, unit: {value: ""}},
        sensitivity: performance.desiredSensitivity ?
            performance.desiredSensitivity : {value: undefined, unit: {value: ""}},
        dynamicRange: performance.desiredDynamicRange ?
            performance.desiredDynamicRange : {value: undefined, unit: {value: ""}},
        spectralPoint: performance.representativeSpectralPoint ?
            performance.representativeSpectralPoint : {value: undefined, unit: {value: ""}},
    }

    const form = useForm<PerformanceValues>({
        initialValues: initialPerformanceValues,
        validate: {

        }
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
        console.log(values)

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