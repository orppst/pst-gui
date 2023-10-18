import PerformanceParametersForm from "./performance.form.tsx";
import ViewEditSpectralWindow from "./spectrum.form.tsx";
import {Space, Grid, Fieldset, Button, Group} from "@mantine/core";
import {TechnicalGoalClose} from "./Goals.tsx";
import {RealQuantity, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";

export interface ScienceSpectrumValues {
    windows: ScienceSpectralWindow []
    spectralPoint: RealQuantity
}

export const notSpecified = "not specified";
export const notSet = "not set";

export default function TechnicalGoalEditGroup(props: TechnicalGoalClose ) {

    const totalCols = 10;
    const performanceCols = 4;
    const spectrumCols = totalCols - performanceCols

    return (
        <>
            <Grid columns={totalCols}>
                <Grid.Col span={{base: totalCols, md: performanceCols}}>
                    <Fieldset legend={"Performance parameters"}>
                        <PerformanceParametersForm newTechnicalGoal={false} performance={props.goal.performance} />
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={{base: totalCols, md: spectrumCols}}>
                    <Fieldset legend={"Spectral windows"}>
                        <ViewEditSpectralWindow
                            windows={props.goal.spectrum!}
                            spectralPoint={props.goal.performance?.representativeSpectralPoint!}
                        />
                    </Fieldset>
                    <Space h={"xs"}/>
                </Grid.Col>

            </Grid>
            <Group justify={"flex-end"}>
                <Button size="sm" onClick={props.close}>
                    finished editing
                </Button>
            </Group>
        </>
    )
}