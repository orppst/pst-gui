import {
    useProposalResourceGetTechnicalGoal
} from "../generated/proposalToolComponents.ts";
import {Box, Grid, Table} from "@mantine/core";
import {PerformanceParameters, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";


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
                        <Table.Th colSpan={2}>Performance Parameters</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>Angular res.: </Table.Td>
                        <Table.Td>{parameters.desiredAngularResolution?.value} {parameters.desiredAngularResolution?.unit?.value}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Largest scale: </Table.Td>
                        <Table.Td>{parameters.desiredLargestScale?.value} {parameters.desiredLargestScale?.unit?.value}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Sensitivity: </Table.Td>
                        <Table.Td>{parameters.desiredSensitivity?.value} {parameters.desiredSensitivity?.unit?.value}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Dynamic range: </Table.Td>
                        <Table.Td>{parameters.desiredDynamicRange?.value} {parameters.desiredDynamicRange?.unit?.value}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Spectral point: </Table.Td>
                        <Table.Td>{parameters.representativeSpectralPoint?.value} {parameters.representativeSpectralPoint?.unit?.value}</Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        )
    }


    function RenderSpectralWindowRow(window: ScienceSpectralWindow){
        return (
            <Table.Tr key={window.index}>
                <Table.Td>Start:</Table.Td>
                <Table.Td>{window.spectralWindowSetup?.start?.value} {window.spectralWindowSetup?.start?.unit?.value}</Table.Td>
                <Table.Td>End:</Table.Td>
                <Table.Td>{window.spectralWindowSetup?.end?.value} {window.spectralWindowSetup?.end?.unit?.value}</Table.Td>
                <Table.Td>Res.:</Table.Td>
                <Table.Td>{window.spectralWindowSetup?.spectralResolution?.value} {window.spectralWindowSetup?.spectralResolution?.unit?.value}</Table.Td>
            </Table.Tr>
        )
    }



    function RenderSpectralWindows(windows: ScienceSpectralWindow[]){
        console.log(windows)
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
                    <Grid columns={5}>
                        <Grid.Col span={2}>
                            <RenderPerformanceParameters {...data?.performance!}/>
                        </Grid.Col>
                        <Grid.Col span={3}>
                            {RenderSpectralWindows(data?.spectrum!) }
                        </Grid.Col>
                    </Grid>
            }
        </>

    )
}