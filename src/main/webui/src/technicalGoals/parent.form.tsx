import ViewEditPerformanceParameters from "./performance.form.tsx";
import ViewEditSpectralWindow from "./spectrum.form.tsx";
import {Button, Group, Text, Accordion, Space, Grid, ActionIcon, Box} from "@mantine/core";
import {TechnicalGoalClose} from "./Goals.tsx";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {useForm, UseFormReturnType} from "@mantine/form";
import {ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";

export interface ScienceSpectrumValues {
    windows: (ScienceSpectralWindow | undefined) [] | undefined
}

export type ScienceSpectrumProps = {
    form: UseFormReturnType<ScienceSpectrumValues>
    index: number
}

export const notSpecified = "not specified";

export default function TechnicalGoalParentForm( props: TechnicalGoalClose ) {

    //for a new TechnicalGoal we only allow setting the performance parameters.
    // The spectral windows can be added after via the edit button (which also takes
    // this route but with goal != undefined)

    const initialWindow : ScienceSpectralWindow = {
        index: undefined,
        spectralWindowSetup: {
            start: undefined,
            end: undefined,
            spectralResolution: undefined,
            isSkyFrequency: false,
            polarization: undefined
        },
        expectedSpectralLine: []
    }

    const form
        = useForm<ScienceSpectrumValues>({
        initialValues: {
            windows: props.goal?.spectrum ? props.goal.spectrum : [initialWindow]
        },
        validate: {}
    })

    function AccordionControl(props : {index: number}) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Accordion.Control>Window {props.index + 1}</Accordion.Control>
                <ActionIcon
                    color={"red.5"}
                    onClick={() =>form.removeListItem("windows", props.index)}
                >
                    <IconTrash size={"1rem"}/>
                </ActionIcon>
            </Box>
        )
    }


    const totalCol = 3;
    const spectralWindowCol = totalCol - 1;

    return (
        <Grid columns={totalCol}>
            <Grid.Col md={props.goal ? 1 : totalCol} span={totalCol}>
                <fieldset>
                    <legend>Performance parameters</legend>
                    <ViewEditPerformanceParameters {...props.goal?.performance} />
                </fieldset>
            </Grid.Col>
            {
                props.goal ?
                    <Grid.Col md={spectralWindowCol} span={totalCol}>
                        <fieldset>
                            <legend>Spectral windows</legend>
                            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                            {
                                form.values.windows?.map((s, mapIndex) => {
                                    return (
                                        <Accordion.Item value={s?.index ? s.index.toString() : (mapIndex + 1).toString()}>
                                            <AccordionControl index={mapIndex} />
                                            <Accordion.Panel>
                                                <ViewEditSpectralWindow form={form} index={mapIndex} />
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    )
                                })
                            }
                            </Accordion>
                            <Space h={"xs"}/>
                            <Group position={"right"}>
                                <ActionIcon
                                    color={"green.5"}
                                    onClick={() => form.insertListItem(
                                        'windows', {...initialWindow}
                                    )}>
                                    <IconPlus size={"2rem"}/>
                                </ActionIcon>
                            </Group>
                            <Group position={"right"}>
                                <Button onClick={props.close}>Done</Button>
                            </Group>
                        </fieldset>
                        <Space h={"xs"}/>

                    </Grid.Col> :
                    <Grid.Col span={totalCol}>
                    <Group>
                        <Text c={"pink.5"} maw={400} align={"center"} size={"xs"}>
                            Creation of a new Technical Goal is done with the performance
                            parameters only. Spectral windows can be added after creation
                            using the view/edit button
                        </Text>
                    </Group>
                    </Grid.Col>
            }
        </Grid>
    )
}