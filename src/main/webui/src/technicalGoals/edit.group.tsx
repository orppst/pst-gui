import PerformanceParametersForm from "./performance.form.tsx";
import ViewEditSpectralWindow from "./spectrum.form.tsx";
import {Space, Grid, Fieldset, Button, Group} from "@mantine/core";
import {TechnicalGoalClose} from "./Goals.tsx";



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
                        <PerformanceParametersForm
                            technicalGoalId={props.goal._id}
                            newTechnicalGoal={false}
                            performance={props.goal.performance}
                        />
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={{base: totalCols, md: spectrumCols}}>
                    <Fieldset legend={"Spectral windows"}>
                        <ViewEditSpectralWindow
                            windows={props.goal.spectrum!}
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