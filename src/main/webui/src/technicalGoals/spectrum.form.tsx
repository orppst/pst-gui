import {
    Accordion, Badge,
    Box, Checkbox,
    Fieldset, Grid,
    Group,
    Select,
    Space, Stack,
    Text,
    TextInput
} from "@mantine/core";
import {notSpecified} from "./edit.group.tsx";
import {
    ExpectedSpectralLine,
    PolStateEnum,
    ScienceSpectralWindow
} from "../generated/proposalToolSchemas.ts";
import DeleteButton from "../commonButtons/delete.tsx";
import AddButton from "../commonButtons/add.tsx";
import {useForm} from "@mantine/form";
import {AccordionDelete} from "../commonButtons/accordianControls.tsx";
import {SubmitButton} from "../commonButtons/save.tsx";
import {frequencyUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit, NumberUnitType} from "../commonInputs/NumberInputPlusUnit.tsx";
import {randomId} from "@mantine/hooks";


type ExpectedSpectralLineAlt = {
    restFrequency: NumberUnitType,
    transition?: string,
    splatalogId?: string,
    description?: string
}

type ScienceSpectralWindowAlt = {
    index?: number | string
    start: NumberUnitType,
    end: NumberUnitType,
    spectralResolution: NumberUnitType,
    isSkyFrequency: boolean,
    polarization: PolStateEnum | undefined
    expectedSpectralLines: ExpectedSpectralLineAlt []
}

interface SpectrumValues {
    windows: ScienceSpectralWindowAlt []
}

function convertExpectedSpectralLineToAlt(input: ExpectedSpectralLine) {
    let expectedSpectralLineAlt : ExpectedSpectralLineAlt = {
        restFrequency: {
            value: input.restFrequency?.value ?? "",
            unit: input.restFrequency?.unit?.value ?? ""
        },
        transition: input.transition,
        splatalogId: input.splatalogId?.value,
        description: input.description
    }

    return expectedSpectralLineAlt;
}

function convertSpectralWindowSetupAlt(input: ScienceSpectralWindow) {
    let spectralWindowSetupAlt : ScienceSpectralWindowAlt = {
        index: input.index,
        start: {
            value: input.spectralWindowSetup?.start?.value ?? "",
            unit: input.spectralWindowSetup?.start?.unit?.value ?? ""
        },
        end: {
            value: input.spectralWindowSetup?.end?.value ?? "",
            unit: input.spectralWindowSetup?.end?.unit?.value ?? ""
        },
        spectralResolution: {
            value: input.spectralWindowSetup?.spectralResolution?.value ?? "",
            unit: input.spectralWindowSetup?.spectralResolution?.unit?.value ?? ""
        },
        isSkyFrequency: input.spectralWindowSetup?.isSkyFrequency ?? false,
        polarization: input.spectralWindowSetup?.polarization ?? undefined,
        expectedSpectralLines: input.expectedSpectralLine ?
            input.expectedSpectralLine.map((line) =>{
            return convertExpectedSpectralLineToAlt(line);
        }) : []
    }

    return spectralWindowSetupAlt;
}

export default function ViewEditSpectralWindow(props: {windows: ScienceSpectralWindow[]}) {

    const emptySpectralLine : ExpectedSpectralLineAlt = {
        restFrequency: {value: "", unit: ""} ,
        transition: "",
        splatalogId: "",
        description: ""
    }

    const emptyWindow : ScienceSpectralWindowAlt = {
        index: "",
        start: {value: "", unit: ""},
        end: {value: "", unit: ""},
        spectralResolution: {value: "", unit: ""},
        isSkyFrequency: false,
        polarization: undefined,
        expectedSpectralLines:[]
    }

    let initialSpectrumValues : SpectrumValues = {
        windows: props.windows ?
            props.windows.map((window) => {
                return convertSpectralWindowSetupAlt(window)
            }) : []
    }

    const form
        = useForm<SpectrumValues>({
        initialValues: initialSpectrumValues,
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
                        valueRoot={`windows.${props.index}.start`}
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
                        valueRoot={`windows.${props.index}.end`}
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
                        valueRoot={`windows.${props.index}.spectralResolution`}
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
                        {...form.getInputProps(`windows.${props.index}.polarization`)}
                    />
                </Grid.Col>
                <Grid.Col span={{base: totalCols/2, xl: 2}}>
                    <Group justify={"center"}>
                        <Checkbox
                            size={"sm"}
                            label={"sky frequency"}
                            pt={25}
                            {...form.getInputProps(`windows.${props.index}.isSkyFrequency`,
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
                <Badge radius={0} color={"teal"}>
                    Work-in-progress: provide a selectable list of potential spectral lines given the spectral range above
                </Badge>
                {
                    form.values.windows?.at(props.index)?.expectedSpectralLines?.length! > 0 ?
                        form.values.windows?.at(props.index)?.expectedSpectralLines?.map((s, index) => {
                            return (
                                <Group grow key={s.splatalogId ? s.splatalogId : randomId()}>
                                    <NumberInputPlusUnit
                                        label={index == 0 ? "Rest frequency" : ''}
                                        form={form}
                                        valueRoot={`windows.${props.index}.expectedSpectralLines.${index}.restFrequency`}
                                        units={frequencyUnits}
                                    />
                                    <TextInput
                                        label={index == 0 ? "Transition:" : ''}
                                        placeholder={notSpecified}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLines.${index}.transition`
                                        )}
                                    />
                                    <TextInput
                                        label={index == 0 ? "Splatalogue id:": ''}
                                        placeholder={notSpecified}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLines.${index}.splatalogId`
                                        )}
                                    />
                                    <TextInput
                                        label={index == 0 ? "Description:" : ''}
                                        placeholder={notSpecified}
                                        {...form.getInputProps(
                                            `windows.${props.index}.expectedSpectralLines.${index}.description`
                                        )}
                                    />
                                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                                        <DeleteButton
                                            toolTipLabel={"remove spectral line " + (index + 1)}
                                            onClick={() => form.removeListItem(
                                                `windows.${props.index}.expectedSpectralLines`, index
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