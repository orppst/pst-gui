import {Group, NumberInput, Select, Stack, Tooltip} from "@mantine/core";
import {useForm} from "@mantine/form";
import {PerformanceParameters, RealQuantity} from "../generated/proposalToolSchemas.ts";
import {notSpecified} from "./edit.group.tsx";
import SaveButton from "../commonButtons/save.tsx";

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

    const angularUnits =  [
        {value: 'microarcsec', label: '\u{03bc}as'},
        {value: 'milliarcsec', label: 'mas'},
        {value: 'arcsec', label: 'arcsec'},
        {value: 'arcmin', label: 'arcmin'},
        {value: 'milliradians', label: 'mrad'},
        {value: 'degrees', label: 'deg'}
    ]

    const frequencyUnits = [
        {value: 'MHz', label: 'MHz'},
        {value: 'GHz', label: 'GHz'},
        {value: 'THz', label: 'THz'},
        {value: 'PHz', label: 'PHz'},
        {value: 'EHz', label: 'EHz'}
    ]

    const PerformanceDetails = () => {
        return (
            <Tooltip.Group openDelay={1000} closeDelay={200}>
                <Stack>
                    <Group grow>
                        <Tooltip
                            label={"desired angular resolution"}
                        >
                            <NumberInput
                                label={"Angular resolution:"}
                                placeholder={notSpecified}
                                hideControls
                                defaultValue={form.values.angularResolution.value}
                                decimalScale={3}
                                step={0.001}
                                min={0}
                                {...form.getInputProps('angularResolution.value')}
                            />
                        </Tooltip>
                        <Select
                            label={"unit:"}
                            placeholder={"pick a unit"}
                            defaultValue={form.values.angularResolution.unit?.value}
                            data={angularUnits}
                            {...form.getInputProps('angularResolution.unit.value')}
                        />
                    </Group>
                    <Group grow>
                        <Tooltip
                            label={"desired largest scale"}
                        >
                            <NumberInput
                                label={"Largest scale:"}
                                placeholder={notSpecified}
                                hideControls
                                defaultValue={form.values.largestScale.value}
                                decimalScale={3}
                                step={0.001}
                                min={0}
                                {...form.getInputProps('largestScale.value')}
                            />
                        </Tooltip>
                        <Select
                            label={"unit:"}
                            placeholder={"pick a unit"}
                            defaultValue={form.values.largestScale.unit?.value}
                            data={angularUnits}
                            {...form.getInputProps('largestScale.unit.value')}
                        />
                    </Group>
                    <Group grow>
                        <Tooltip
                            label={"desired sensitivity in decibels "}
                        >
                            <NumberInput
                                label={"Sensitivity:"}
                                placeholder={notSpecified}
                                hideControls
                                defaultValue={form.values.sensitivity.value}
                                decimalScale={3}
                                step={0.001}
                                min={0}
                                {...form.getInputProps('sensitivity.value')}
                            />
                        </Tooltip>
                        <Tooltip label={"dB units only"} position={"right"}>
                            <Select
                                label={"unit:"}
                                disabled
                                placeholder={'dB'}
                                defaultValue={'decibels'}
                                data={[{value: 'decibels', label: 'dB'}]}
                                {...form.getInputProps('sensitivity.unit.value')}
                            />
                        </Tooltip>
                    </Group>
                    <Group grow>
                        <Tooltip
                            label={"desired dynamic range in decibels"}
                        >
                            <NumberInput
                                label={"Dynamic range:"}
                                placeholder={notSpecified}
                                hideControls
                                defaultValue={form.values.dynamicRange.value}
                                decimalScale={2}
                                step={0.01}
                                min={0}
                                {...form.getInputProps('dynamicRange.value')}
                            />
                        </Tooltip>
                        <Tooltip label={"dB units only"} position={"right"}>
                            <Select
                                label={"unit:"}
                                disabled
                                placeholder={'dB'}
                                defaultValue={'decibels'}
                                data={[{value: 'decibels', label: 'dB'}]}
                                {...form.getInputProps('dynamicRange.unit.value')}
                            />
                        </Tooltip>
                    </Group>
                    <Group grow>
                        <Tooltip
                            label={"representative spectral point frequency"}
                        >
                            <NumberInput
                                label={"Spectral point (f):"}
                                placeholder={notSpecified}
                                hideControls
                                defaultValue={form.values.spectralPoint.value}
                                decimalScale={6}
                                min={0}
                                {...form.getInputProps('spectralPoint.value')}
                            />
                        </Tooltip>
                        <Select
                            label={"unit:"}
                            placeholder={"pick a unit"}
                            defaultValue={form.values.spectralPoint.unit?.value}
                            data={frequencyUnits}
                            {...form.getInputProps('spectralPoint.unit.value')}
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