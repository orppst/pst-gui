import {Box, Table} from "@mantine/core";
import {PerformanceParameters, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";
import {notSet} from "./edit.group.tsx";
import {useTechnicalGoalResourceGetTechnicalGoal} from "../generated/proposalToolComponents.ts";
import {angularUnits, frequencyUnits, locateLabel, sensitivityUnits} from "../physicalUnits/PhysicalUnits.tsx";


type RenderTechnicalGoalProps = {
    proposalCode: number, dbid: number
}

export function RenderTechnicalGoal(props: RenderTechnicalGoalProps) {

    const {data, error, isLoading} =
        useTechnicalGoalResourceGetTechnicalGoal( {
            pathParams: {
                proposalCode: props.proposalCode,
                technicalGoalId: props.dbid}
        });

    if (error) {
        return <Box>Error loading technical goal</Box>
    }

    const RenderPPTableBody = (parameters: PerformanceParameters) => {
        return (<Table.Tbody>
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
        </Table.Tbody>)
    }

    const RenderPerformanceParameters = (parameters: PerformanceParameters) => {
        return (
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th colSpan={4}>Performance Parameters</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <RenderPPTableBody {...parameters!}/>
            </Table>
        )
    }


    function RenderSpectralWindowRow(window: ScienceSpectralWindow){
        /*
        triggers the warning:
            Warning: Each child in a list should have a unique "key" prop.
         This suggests window.index is somehow not unique or the table headers need keys, should investigate
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



    function RenderSpectralWindows(windows: ScienceSpectralWindow[]){
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