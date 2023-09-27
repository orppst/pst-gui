import {ActionIcon, Group, NumberInput, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {IconDeviceFloppy} from "@tabler/icons-react";
import {PerformanceParameters} from "../generated/proposalToolSchemas.ts";


interface PerformanceValues {
    angularResolution: number | undefined,
    largestScale: number | undefined,
    sensitivity: number | undefined,
    dynamicRange: number | undefined,
    spectralPoint: number | undefined
}

export default function ViewEditPerformanceParameters(performance: PerformanceParameters) {

    let initialPerformanceValues : PerformanceValues = {
        angularResolution: performance.desiredAngularResolution?.value,
        largestScale: performance.desiredLargestScale?.value,
        sensitivity: performance.desiredSensitivity?.value,
        dynamicRange: performance.desiredDynamicRange?.value,
        spectralPoint: performance.representativeSpectralPoint?.value
    }

    const form = useForm<PerformanceValues>({
        initialValues: initialPerformanceValues,
        validate: {

        }
    });

    const holdInterval = (t:number) => Math.max(1000/t**2, 1);

    const PerformanceDetails = () => {
        return (
            <>
                <NumberInput
                    label={"Angular resolution (arcsec):"}
                    placeholder={"not set"}
                    defaultValue={form.values.angularResolution}
                    precision={3}
                    step={0.001}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('angularResolution')}
                />
                <NumberInput
                    label={"Largest scale (degrees):"}
                    placeholder={"not set"}
                    defaultValue={form.values.largestScale}
                    precision={3}
                    step={0.001}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('largestScale')}
                />
                <NumberInput
                    label={"Sensitivity (dB):"}
                    placeholder={"not set"}
                    defaultValue={form.values.sensitivity}
                    precision={3}
                    step={0.001}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('sensitivity')}
                />
                <NumberInput
                    label={"Dynamic range (dB):"}
                    placeholder={"not set"}
                    defaultValue={form.values.dynamicRange}
                    precision={2}
                    step={0.01}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('dynamicRange')}
                />
                <NumberInput
                    label={"Representative spectral point (GHz):"}
                    placeholder={"not set"}
                    defaultValue={form.values.spectralPoint}
                    precision={2}
                    step={0.01}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('spectralPoint')}
                />
            </>
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
            <Group position="right" mt="md">
                <Tooltip openDelay={1000} label={"save performance parameters"}>
                    <ActionIcon size={"xl"} color={"indigo.5"} type="submit">
                        <IconDeviceFloppy size={"3rem"}/>
                    </ActionIcon>
                </Tooltip>
            </Group>
        </form>
    )
}