import {
    Accordion,
    Box,
    Checkbox, Fieldset,
    Group,
    NumberInput,
    Select,
    Space,
    Text,
    TextInput
} from "@mantine/core";
import {notSpecified, ScienceSpectrumValues} from "./edit.group.tsx";
import {ExpectedSpectralLine, ScienceSpectralWindow} from "../generated/proposalToolSchemas.ts";
import DeleteButton from "../commonButtons/delete.tsx";
import AddButton from "../commonButtons/add.tsx";
import {useForm} from "@mantine/form";
import {AccordionDelete} from "../commonButtons/accordianControls.tsx";

export default function ViewEditSpectralWindow(props: ScienceSpectrumValues) {

    const decimalPlaces = 3;
    const step = 0.001;

    const emptyWindow : ScienceSpectralWindow = {
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
            windows: props? props.windows: [emptyWindow]
        },
        validate: {}
    })


    const renderWindowSetup = (props: {index: number}) => {
        return (
            <Group grow>
                <NumberInput
                    label={"Start:"}
                    placeholder={notSpecified}
                    decimalScale={decimalPlaces}
                    step={step}
                    min={0}
                    {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.start.value`)}
                />
                <NumberInput
                    label={"End:"}
                    placeholder={notSpecified}
                    decimalScale={decimalPlaces}
                    step={step}
                    min={0}
                    {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.end.value`)}
                />
                <NumberInput
                    label={"Spectral resolution:"}
                    placeholder={notSpecified}
                    decimalScale={decimalPlaces}
                    step={step}
                    min={0}
                    {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.spectralResolution.value`)}
                />
                <Select
                    label={"Polarization:"}
                    placeholder={"pick one"}
                    data={[
                        "I","Q","U","V","RR","LL","RL","LR","XX","YY","XY","YX","PF","PP","PA"
                    ]}
                    {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.polarization`)}
                />
                <Checkbox pt={25}
                    label={"Sky frequency"}
                    {...form.getInputProps(`windows.${props.index}.spectralWindowSetup.isSkyFrequency`,
                        {type: 'checkbox'})}
                />
            </Group>
        )
    }

    const renderSpectralLines = (props: {index: number}) => {

        const emptySpectralLine : ExpectedSpectralLine = {}

        return (
            <Fieldset legend={"Spectral lines"}>
                {
                    form.values.windows?.at(props.index)?.expectedSpectralLine?.length! > 0 ?
                        form.values.windows?.at(props.index)?.expectedSpectralLine?.map((_s, index) => {
                            return (
                                <Group grow>
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
                        <Text c={"yellow.5"}>None specified</Text>
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
                    form.values.windows?.map((_s, mapIndex) => {
                        let labelIndex = (mapIndex + 1).toString();
                        return (
                            <Accordion.Item value={labelIndex}>
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
                <AddButton
                    toolTipLabel={"add a spectral window"}
                    onClick={() => form.insertListItem('windows', {...emptyWindow})}
                />
            </Group>
        </form>
    )
}