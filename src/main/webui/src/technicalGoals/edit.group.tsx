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

    return (
        <Grid columns={5}>
            <Grid.Col span={{base: 5, lg: 2}}>
                <Fieldset legend={"Performance parameters"}>
                    <PerformanceParametersForm {...props.goal.performance} />
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={{base: 5, lg: 3}}>
                <Fieldset legend={"Spectral windows"}>
                    <ViewEditSpectralWindow windows={props.goal.spectrum} />
                </Fieldset>
                <Space h={"xs"}/>
            </Grid.Col>
        </Grid>
    )
}