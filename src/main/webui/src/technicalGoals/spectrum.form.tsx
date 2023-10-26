import {
    Accordion,
    Box, Checkbox,
    Fieldset, Grid,
    Group,
    NumberInput,
    Select,
    Space, Stack,
    Text,
    TextInput
} from "@mantine/core";
import {notSpecified, ScienceSpectrumValues} from "./edit.group.tsx";
import {ExpectedSpectralLine, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";
import DeleteButton from "../commonButtons/delete.tsx";
import AddButton from "../commonButtons/add.tsx";
import {useForm} from "@mantine/form";
import {AccordionDelete} from "../commonButtons/accordianControls.tsx";
import {SubmitButton} from "../commonButtons/save.tsx";
import {frequencyUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit} from "../commonInputs/NumberInputPlusUnit.tsx";
import {randomId} from "@mantine/hooks";

export default function ViewEditSpectralWindow(props: ScienceSpectrumValues) {

    const decimalPlaces = 3;
    const step = 0.001;

    const emptySpectralLine : ExpectedSpectralLine = {
        restFrequency: {value: undefined, unit: {value: undefined}},
        transition: undefined,
        splatalogId: {value: undefined},
        description: undefined
    }

    const emptyWindow : ScienceSpectralWindow = {
        index: undefined,
        spectralWindowSetup: {
            start: {value: undefined, unit: {value: undefined}},
            end: {value: undefined, unit: {value: undefined}},
            spectralResolution: {value: undefined, unit: {value: undefined}},
            isSkyFrequency: false,
            polarization: undefined
        },
        expectedSpectralLine:[]
    }

    const form
        = useForm<ScienceSpectrumValues>({
        initialValues: {
            windows: props? props.windows: [emptyWindow],
            spectralPoint: props.spectralPoint
        },
        validate: {}
    })


    const renderWindowSetup = (props: {index: number}) => {
        const totalCols = 16;

        return (
            <Grid columns={totalCols} gutter={0}>
                <Grid.Col span={{base: totalCols, xl: 4}}>
                    <NumberInputPlusUnit
                        color={"cyan"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"Start"}
                        valueRoot={`windows.${props.index}.spectralWindowSetup.start`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: totalCols, xl: 4}}>
                    <NumberInputPlusUnit
                        color={"indigo"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"End"}
                        valueRoot={`windows.${props.index}.spectralWindowSetup.end`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: totalCols, xl: 4}}>
                    <NumberInputPlusUnit
                        color={"violet"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"Resolution"}
                        valueRoot={`windows.${props.index}.spectralWindowSetup.spectralResolution`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: totalCols/2, xl: 2}}>
                    <Select
                        label={"Polarization:"}
                        placeholder={"pick one"}
                        px={5}
                        data={[
                            "I","Q","U","V","RR","LL","RL","LR","XX","YY","XY","YX","PF","PP","PA"
                        ]}
                        {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.polarization`)}
                    />
                </Grid.Col>
                <Grid.Col span={{base: totalCols/2, xl: 2}}>
                    <Group justify={"center"}>
                        <Checkbox
                            size={"sm"}
                            label={"sky frequency"}
                            pt={25}
                            {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.isSkyFrequency`,
                                {type: 'checkbox'})}
                        />
                    </Group>
                </Grid.Col>
            </Grid>
        )
    }

    const renderSpectralLines = (props: {index: number}) => {
        return (
            <Fieldset legend={"Spectral lines"}>
                {
                    form.values.windows?.at(props.index)?.expectedSpectralLine?.length! > 0 ?
                        form.values.windows?.at(props.index)?.expectedSpectralLine?.map((s, index) => {
                            return (
                                <Group grow key={s.splatalogId ? s.splatalogId.value : randomId()}>
                                    <NumberInput
                                        label={index == 0 ? "Rest frequency:" : ''}
                                        placeholder={notSpecified}
                                        decimalScale={decimalPlaces}
                                        step={step}
                                        min={0}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLine.${index}.restFrequency.value`
                                        )}
                                    />
                                    <TextInput
                                        label={index == 0 ? "Transition:" : ''}
                                        placeholder={notSpecified}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLine.${index}.transition`
                                        )}
                                    />
                                    <TextInput
                                        label={index == 0 ? "Splatalogue id:": ''}
                                        placeholder={notSpecified}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLine.${index}.splatalogId.value`
                                        )}
                                    />
                                    <TextInput
                                        label={index == 0 ? "Description:" : ''}
                                        placeholder={notSpecified}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLine.${index}.description`
                                        )}
                                    />
                                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                                        <DeleteButton
                                            toolTipLabel={"remove spectral line " + (index + 1)}
                                            onClick={() => form.removeListItem(
                                                `windows.${props.index}.expectedSpectralLine`, index
                                            )} />
                                    </Box>
                                </Group>
                            )
                        })
                        :
                        <Text c={"orange.5"}>None specified</Text>
                }
                <Space h={"xs"} />
                <Group justify={"flex-end"}>
                    <AddButton
                        toolTipLabel={"add a spectral line"}
                        onClick={() => form.insertListItem(
                            `windows.${props.index}.expectedSpectralLine`, {...emptySpectralLine}
                        )}
                    />
                </Group>
            </Fieldset>
        )
    }

    const handleSubmit = form.onSubmit((values) => {
        console.log(values)
    })

    return(
        <form onSubmit={handleSubmit}>
            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                {
                    form.values.windows?.map((s, mapIndex) => {
                        let labelIndex = (mapIndex + 1).toString();
                        return (
                            <Accordion.Item value={labelIndex} key={s ? s.index : randomId()}>
                                <AccordionDelete
                                    title={"Window " + labelIndex}
                                    deleteProps={{
                                        toolTipLabel: "remove spectral window " + labelIndex,
                                        onClick: ()=>form.removeListItem("windows", mapIndex)
                                    }}
                                />
                                <Accordion.Panel>
                                    {renderWindowSetup({index: mapIndex})}
                                    {renderSpectralLines({index: mapIndex})}
                                </Accordion.Panel>
                            </Accordion.Item>
                        )
                    })
                }
            </Accordion>
            <Space h={"xs"}/>
            <Group justify={"flex-end"}>
                <Stack>
                    <AddButton
                        toolTipLabel={"add a spectral window"}
                        onClick={() => form.insertListItem('windows', {...emptyWindow})}
                    />
                    <SubmitButton toolTipLabel={"save changes to spectral windows"} />
                </Stack>

            </Group>


        </form>
    )
}