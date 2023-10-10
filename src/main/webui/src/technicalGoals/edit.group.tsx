import PerformanceParametersForm from "./performance.form.tsx";
import ViewEditSpectralWindow from "./spectrum.form.tsx";
import {Space, Grid,  Fieldset} from "@mantine/core";
import {TechnicalGoalClose} from "./Goals.tsx";
import {ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";

export interface ScienceSpectrumValues {
    windows: (ScienceSpectralWindow | undefined) [] | undefined
}

export const notSpecified = "not specified";

export default function TechnicalGoalEditGroup(props: TechnicalGoalClose ) {

    const totalCols = 8;
    const performanceCols = 3;
    const spectrumCols = totalCols - performanceCols

    return (
        <Grid columns={totalCols}>
            <Grid.Col span={{base: totalCols, lg: performanceCols}}>
                <Fieldset legend={"Performance parameters"}>
                    <PerformanceParametersForm {...props.goal.performance} />
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={{base: totalCols, lg: spectrumCols}}>
                <Fieldset legend={"Spectral windows"}>
                    <ViewEditSpectralWindow windows={props.goal.spectrum} />
                </Fieldset>
                <Space h={"xs"}/>
            </Grid.Col>
        </Grid>
    )
}