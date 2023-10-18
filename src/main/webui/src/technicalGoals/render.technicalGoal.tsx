import {
    useProposalResourceGetTechnicalGoal
} from "../generated/proposalToolComponents.ts";
import {Box, Table} from "@mantine/core";
import {PerformanceParameters, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";
import {notSet} from "./edit.group.tsx";


type RenderTechnicalGoalProps = {
    proposalCode: number, dbid: number
}

export function RenderTechnicalGoal(props: RenderTechnicalGoalProps) {

    const {data, error, isLoading} =
        useProposalResourceGetTechnicalGoal( {
            pathParams: {proposalCode: props.proposalCode, technicalGoalId: props.dbid}
        });

    if (error) {
        return <Box>Error loading technical goal</Box>
    }

    const RenderPerformanceParameters = (parameters: PerformanceParameters) => {
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
                            parameters.desiredAngularResolution ?
                                <Table.Td>{parameters.desiredAngularResolution?.value} {parameters.desiredAngularResolution?.unit?.value}</Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        <Table.Td>Largest scale </Table.Td>
                        {
                            parameters.desiredLargestScale ?
                                <Table.Td>{parameters.desiredLargestScale?.value} {parameters.desiredLargestScale?.unit?.value}</Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Sensitivity</Table.Td>
                        {
                            parameters.desiredSensitivity ?
                                <Table.Td>{parameters.desiredSensitivity?.value} {parameters.desiredSensitivity?.unit?.value}</Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                        <Table.Td>Dyn. range</Table.Td>
                        {
                            parameters.desiredDynamicRange ?
                                <Table.Td>{parameters.desiredDynamicRange?.value} {parameters.desiredDynamicRange?.unit?.value}</Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Spectral point</Table.Td>
                        {
                            parameters.representativeSpectralPoint ?
                                <Table.Td>{parameters.representativeSpectralPoint?.value} {parameters.representativeSpectralPoint?.unit?.value}</Table.Td> :
                                <Table.Td c={"yellow"}>{notSet}</Table.Td>
                        }
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        )
    }


    function RenderSpectralWindowRow(window: ScienceSpectralWindow){
        return (
            <Table.Tr key={window.index}>
                <Table.Th>Start</Table.Th>
                <Table.Td>{window.spectralWindowSetup?.start?.value} {window.spectralWindowSetup?.start?.unit?.value}</Table.Td>
                <Table.Th>End</Table.Th>
                <Table.Td>{window.spectralWindowSetup?.end?.value} {window.spectralWindowSetup?.end?.unit?.value}</Table.Td>
                <Table.Th>Res.</Table.Th>
                <Table.Td>{window.spectralWindowSetup?.spectralResolution?.value} {window.spectralWindowSetup?.spectralResolution?.unit?.value}</Table.Td>
            </Table.Tr>
        )
    }



    function RenderSpectralWindows(windows: ScienceSpectralWindow[]){
        return (
            <Table>
                <Table.Thead>
                    <Table.Tr><Table.Th colSpan={6}>Spectral Windows</Table.Th></Table.Tr>
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