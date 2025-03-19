import {Box, Group, Stack, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {angularUnits, frequencyUnits, dynamicRangeUnits, fluxUnits} from "src/physicalUnits/PhysicalUnits.tsx";
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
    {form} : {form: UseFormReturnType<TechnicalGoalValues>}):
        ReactElement {
    const PerformanceDetails = () => {
        return (
            <Tooltip.Group openDelay={OPEN_DELAY} closeDelay={CLOSE_DELAY}>
                <Box mt={10} mx={"10%"} w="85%">
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
                                units={fluxUnits} />
                        </Group>
                        <Group grow>
                            <NumberInputPlusUnit
                                form={form}
                                label={"Dynamic range"}
                                toolTip={"desired dynamic range"}
                                valueRoot={'performanceParameters.dynamicRange'}
                                units={dynamicRangeUnits}
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
                </Box>
            </Tooltip.Group>
        )
    }

    return (
        <>
            {
                PerformanceDetails()
            }
        </>
    )
}