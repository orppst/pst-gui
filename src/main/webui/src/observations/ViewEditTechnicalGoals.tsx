import {ActionIcon, Group, NumberInput, Text, Tooltip} from "@mantine/core";
import {TechnicalGoalsProps} from "./table.row.tsx";
import {useForm} from "@mantine/form";
import {IconDeviceFloppy} from "@tabler/icons-react";

export default function ViewEditTechnicalGoals(props: TechnicalGoalsProps) {

    const form = useForm({
            initialValues: {

            }
    });

    function RenderPerformanceDetails() {
        return (
            <fieldset>
                <legend>Performance details</legend>
                <Group>
                    <NumberInput
                        label={"Angular resolution (arcsec):"}
                        placeholder={"not set"}
                        defaultValue={props.goal.performance?.desiredAngularResolution?.value}
                        precision={3}
                        step={0.001}
                        min={0}
                        stepHoldDelay={500}
                        stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                    />
                    <NumberInput
                        label={"Largest scale (degrees):"}
                        placeholder={"not set"}
                        defaultValue={props.goal.performance?.desiredLargestScale?.value}
                        precision={3}
                        step={0.001}
                        min={0}
                        stepHoldDelay={500}
                        stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                    />
                    <NumberInput
                        label={"Sensitivity (dB):"}
                        placeholder={"not set"}
                        defaultValue={props.goal.performance?.desiredSensitivity?.value}
                        precision={3}
                        step={0.001}
                        min={0}
                        stepHoldDelay={500}
                        stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                    />
                    <NumberInput
                        label={"Dynamic range (dB):"}
                        placeholder={"not set"}
                        defaultValue={props.goal.performance?.desiredDynamicRange?.value}
                        precision={2}
                        step={0.01}
                        min={0}
                        stepHoldDelay={500}
                        stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                    />
                    <NumberInput
                        label={"Representative spectral point (GHz):"}
                        placeholder={"not set"}
                        defaultValue={props.goal.performance?.representativeSpectralPoint?.value}
                        precision={2}
                        step={0.01}
                        min={0}
                        stepHoldDelay={500}
                        stepHoldInterval={(t:number) => Math.max(1000/t**2, 1)}
                    />
                </Group>
            </fieldset>
        )
    }


    function RenderSpectrumDetails() {
        return (
            <fieldset>
                <legend>Spectrum details</legend>
                <Text
                    color={"orange"}
                    size={"xl"}
                    weight={500}
                    align={"center"}
                >
                    Under Construction
                </Text>
            </fieldset>
        )
    }

    return (
        <form
            onSubmit={form.onSubmit(
                ()=>console.log("Save pressed")
            )}
        >
            <RenderPerformanceDetails/>
            <RenderSpectrumDetails />
            <Group position="right" mt="md">
                <Tooltip label={"Save"}>
                    <ActionIcon size={"xl"} color={"indigo.5"} type="submit">
                        <IconDeviceFloppy size={"3rem"}/>
                    </ActionIcon>
                </Tooltip>
            </Group>
        </form>
    )
}