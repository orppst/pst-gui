import {Box, Table} from "@mantine/core";
import {PerformanceParameters, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";
import {notSet} from "./edit.group.tsx";
import {useTechnicalGoalResourceGetTechnicalGoal} from "../generated/proposalToolComponents.ts";
import {angularUnits, frequencyUnits, locateLabel, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";
import { ReactElement } from 'react';

/**
 *  Provides a means to build a "stylish" summary table for display in the
 *  Proposal Overview
 */

/**
 * the render data.
 * @param {number} proposalCode the proposal code in the database.
 * @param {number} dbid the database id.
 */
type RenderTechnicalGoalProps = {
    proposalCode: number,
    dbid: number
}

/**
 * builds the summary table for the technical goals.
 *
 * @param {RenderTechnicalGoalProps} props the data.
 * @return {React.ReactElement} the dynaqmic html for the table.
 * @constructor
 */
export function RenderTechnicalGoal(props: RenderTechnicalGoalProps):
        ReactElement {

    const {data, error, isLoading} =
        useTechnicalGoalResourceGetTechnicalGoal( {
            pathParams: {
                proposalCode: props.proposalCode,
                technicalGoalId: props.dbid}
        });

    if (error) {
        return <Box>Error loading technical goal</Box>
    }

    /**
     * produces the html for the performance parameters table.
     *
     * @param {PerformanceParameters} parameters the performance params data.
     * @return {ReactElement} the dynamic html for the performance params.
     * @constructor
     */
    const RenderPerformanceParameters = (parameters: PerformanceParameters):
            ReactElement => {
        return (
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th colSpan={4}>Performance Parameters</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>Angular res. </Table.Td>
                        {
                            parameters.desiredAngularResolution?.value ?
                                <Table.Td>
                                    {parameters.desiredAngularResolution?.value}
                                    {` ${ locateLabel(
                                        angularUnits,
                                        parameters.desiredAngularResolution?.unit?.value)?.label }`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        <Table.Td>Largest scale </Table.Td>
                        {
                            parameters.desiredLargestScale?.value ?
                                <Table.Td>
                                    {parameters.desiredLargestScale?.value}
                                    {` ${ locateLabel(
                                        angularUnits,
                                        parameters.desiredLargestScale?.unit?.value)?.label }`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Sensitivity</Table.Td>
                        {
                            parameters.desiredSensitivity?.value ?
                                <Table.Td>
                                    {parameters.desiredSensitivity?.value}
                                    {` ${ locateLabel(
                                        sensitivityUnits,
                                        parameters.desiredSensitivity?.unit?.value)?.label}`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        <Table.Td>Dyn. range</Table.Td>
                        {
                            parameters.desiredDynamicRange?.value ?
                                <Table.Td>
                                    {parameters.desiredDynamicRange?.value}
                                    {` ${ locateLabel(sensitivityUnits,
                                        parameters.desiredDynamicRange?.unit?.value)?.label}`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Spectral point</Table.Td>
                        {
                            parameters.representativeSpectralPoint?.value ?
                                <Table.Td>
                                    {parameters.representativeSpectralPoint?.value}
                                    {` ${ locateLabel(frequencyUnits,
                                        parameters.representativeSpectralPoint?.unit?.value)?.label}`}
                                </Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        )
    }

    /**
     * produces the spectral window table row.
     *
     * @param {ScienceSpectralWindow} window the spectral window to present.
     * @return {React.ReactElement} the dynamic html for the row.
     * @constructor
     */
    function RenderSpectralWindowRow(window: ScienceSpectralWindow):
            ReactElement {
        /*
        triggers the warning:
            Warning: Each child in a list should have a unique "key" prop.
         This suggests window.index is somehow not unique or the table headers
         need keys, should investigate
         */

        return (
            <Table.Tr key={window.index}>
                <Table.Th>Start</Table.Th>
                <Table.Td>{window.spectralWindowSetup?.start?.value}
                    {window.spectralWindowSetup?.start?.unit?.value}
                </Table.Td>
                <Table.Th>End</Table.Th>
                <Table.Td>{window.spectralWindowSetup?.end?.value}
                    {window.spectralWindowSetup?.end?.unit?.value}
                </Table.Td>
                <Table.Th>Res.</Table.Th>
                <Table.Td>{window.spectralWindowSetup?.spectralResolution?.value}
                    {window.spectralWindowSetup?.spectralResolution?.unit?.value}
                </Table.Td>
            </Table.Tr>
        )
    }

    /**
     * generates the html for the windows table.
     *
     * @param {ScienceSpectralWindow[]} windows the data containing all the
     * spectral windows to present.
     * @return {ReactElement} The dynamic html for all the windows.
     * @constructor
     */
    function RenderSpectralWindows(windows: ScienceSpectralWindow[]):
            ReactElement {
        return (
            <Table>
                <Table.Thead>
                    <Table.Tr><Table.Th colSpan={6}>
                        Spectral Windows
                    </Table.Th></Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {
                        windows.map((window)=>{
                            return <RenderSpectralWindowRow {...window}/>
                        })
                    }
                </Table.Tbody>
            </Table>
        )
    }

    return (
        <>
            {
                isLoading ? 'loading...' :
                    <Table>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td>
                                    <RenderPerformanceParameters {...data?.performance!}/>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td>
                                    {RenderSpectralWindows(data?.spectrum!) }
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
            }
        </>
    )
}