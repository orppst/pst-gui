import {Fieldset, Group, Stack, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {angularUnits, frequencyUnits, sensitivityUnits} from "src/physicalUnits/PhysicalUnits.tsx";
import { NumberInputPlusUnit} from "src/commonInputs/NumberInputPlusUnit.tsx";
import {ReactElement} from "react";
import {TechnicalGoalValues} from "./edit.group.tsx";
import { CLOSE_DELAY, OPEN_DELAY } from 'src/constants.tsx';



/**
 * creates the Performance Parameter section of the Technical Goal form
 *
 * @param {UseFormReturnType<TechnicalGoalValues>} form the form for the page.
 * @return {ReactElement} the generated HTML for the performance form.
 * @constructor
 */
export default function PerformanceParametersSection(
    form : UseFormReturnType<TechnicalGoalValues>):
        ReactElement {
    const PerformanceDetails = () => {
        return (
            <Tooltip.Group openDelay={OPEN_DELAY} closeDelay={CLOSE_DELAY}>
                <Stack>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Angular resolution"}
                            toolTip={"desired angular resolution"}
                            valueRoot={'performanceParameters.angularResolution'}
                            units={angularUnits}
                        />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={'Largest scale'}
                            toolTip={"desired largest scale"}
                            valueRoot={'performanceParameters.largestScale'}
                            units={angularUnits}
                        />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Sensitivity"}
                            toolTip={"desired sensitivity"}
                            valueRoot={'performanceParameters.sensitivity'}
                            units={sensitivityUnits} />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Dynamic range"}
                            toolTip={"desired dynamic range"}
                            valueRoot={'performanceParameters.dynamicRange'}
                            units={sensitivityUnits}
                        />
                    </Group>
                    <Group grow>
                        <NumberInputPlusUnit
                            form={form}
                            label={"Spectral point"}
                            toolTip={"representative spectral frequency"}
                            valueRoot={'performanceParameters.spectralPoint'}
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