import {Group, NumberInput, Stack, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {PerformanceParameters} from "../generated/proposalToolSchemas.ts";
import {notSpecified} from "./edit.group.tsx";
import SaveButton from "../commonButtons/save.tsx";


interface PerformanceValues {
    angularResolution: number | undefined,
    largestScale: number | undefined,
    sensitivity: number | undefined,
    dynamicRange: number | undefined,
    spectralPoint: number | undefined
}

export default function PerformanceParametersForm(performance: PerformanceParameters) {

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

    //TODO: set the desired unit rather than forced to use the ones the devs chose

    const PerformanceDetails = () => {
        return (
            <Tooltip.Group openDelay={1000} closeDelay={200}>
                <Stack>
                    <Tooltip
                        label={"desired angular resolution in arcseconds"}
                    >
                        <NumberInput
                            label={"Angular resolution:"}
                            placeholder={notSpecified}
                            suffix={' \u{2033}'}
                            hideControls
                            defaultValue={form.values.angularResolution}
                            decimalScale={3}
                            step={0.001}
                            min={0}
                            {...form.getInputProps('angularResolution')}
                        />
                    </Tooltip>
                    <Tooltip
                        label={"desired largest scale in degrees"}
                    >
                        <NumberInput
                            label={"Largest scale:"}
                            placeholder={notSpecified}
                            suffix={' \u00B0'}
                            hideControls
                            defaultValue={form.values.largestScale}
                            decimalScale={3}
                            step={0.001}
                            min={0}
                            {...form.getInputProps('largestScale')}
                        />
                    </Tooltip>
                    <Tooltip
                        label={"desired sensitivity in decibels "}
                    >
                        <NumberInput
                            label={"Sensitivity:"}
                            placeholder={notSpecified}
                            suffix={' dB'}
                            hideControls
                            defaultValue={form.values.sensitivity}
                            decimalScale={3}
                            step={0.001}
                            min={0}
                            {...form.getInputProps('sensitivity')}
                        />
                    </Tooltip>
                    <Tooltip
                        label={"desired dynamic range in decibels"}
                    >
                        <NumberInput
                            label={"Dynamic range:"}
                            placeholder={notSpecified}
                            suffix={' dB'}
                            hideControls
                            defaultValue={form.values.dynamicRange}
                            decimalScale={2}
                            step={0.01}
                            min={0}
                            {...form.getInputProps('dynamicRange')}
                        />
                    </Tooltip>
                    <Tooltip
                        label={"representative spectral point in GHz"}
                    >
                        <NumberInput
                            label={"Representative spectral point:"}
                            placeholder={notSpecified}
                            suffix={' GHz'}
                            hideControls
                            defaultValue={form.values.spectralPoint}
                            decimalScale={2}
                            step={0.01}
                            min={0}
                            {...form.getInputProps('spectralPoint')}
                        />
                    </Tooltip>
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