import {Fieldset, Group, Stack, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {angularUnits, frequencyUnits, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";
import { NumberInputPlusUnit} from "../commonInputs/NumberInputPlusUnit.tsx";
import {ReactElement} from "react";
import {TechnicalGoalValues} from "./edit.group.tsx";


/**
 * creates the Performance Parameter section of the Technical Goal form
 *
 * @param {UseFormReturnType<TechnicalGoalValues>} form
 * @return {ReactElement} the generated HTML for the performance form.
 * @constructor
 */
export default function PerformanceParametersSection(
    form : UseFormReturnType<TechnicalGoalValues>
) : ReactElement
{

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

    return (
        <Fieldset legend={"Performance parameters"}>
            {PerformanceDetails()}
        </Fieldset>
    )
}