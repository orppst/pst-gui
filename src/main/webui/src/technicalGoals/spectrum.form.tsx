import {
    ActionIcon,
    Box,
    Checkbox,
    Group,
    NumberInput,
    Select,
    Space,
    Text,
    TextInput
} from "@mantine/core";
import {notSpecified, ScienceSpectrumProps} from "./parent.form.tsx";
import {IconPlus, IconTrash} from "@tabler/icons-react";
import {ExpectedSpectralLine} from "../generated/proposalToolSchemas.ts";

export default function ViewEditSpectralWindow(props: ScienceSpectrumProps) {

    const precision = 3;
    const step = 0.001;


    const renderWindowSetup = () => {
        return (
            <Group grow>
                <NumberInput
                    label={"Start:"}
                    placeholder={notSpecified}
                    precision={precision}
                    step={step}
                    min={0}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.start.value`)}
                />
                <NumberInput
                    label={"End:"}
                    placeholder={notSpecified}
                    precision={precision}
                    step={step}
                    min={0}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.end.value`)}
                />
                <NumberInput
                    label={"Spectral resolution:"}
                    placeholder={notSpecified}
                    precision={precision}
                    step={step}
                    min={0}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.spectralResolution.value`)}
                />
                <Select
                    label={"Polarization:"}
                    placeholder={"pick one"}
                    data={[
                        "I","Q","U","V","RR","LL","RL","LR","XX","YY","XY","YX","PF","PP","PA"
                    ]}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.polarization`)}
                />
                <Checkbox pt={25}
                    label={"Sky frequency"}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.isSkyFrequency`,
                        {type: 'checkbox'})}
                />
            </Group>
        )
    }

    const renderSpectralLines = () => {

        const emptySpectralLine : ExpectedSpectralLine = {}

        return (
            <fieldset>
                <legend>Spectral lines</legend>
                {
                    props.form.values.windows?.at(props.index)?.expectedSpectralLine?.length! > 0 ?
                        props.form.values.windows?.at(props.index)?.expectedSpectralLine?.map((_s, index) => {
                            return (
                                <>
                                    <Group grow>
                                        <NumberInput
                                            label={index == 0 ? "Rest frequency:" : ''}
                                            placeholder={notSpecified}
                                            precision={precision}
                                            step={step}
                                            min={0}
                                            {...props.form.getInputProps(
                                                `windows.${props.index}.expectedSpectralLine.${index}.restFrequency.value`
                                            )}
                                        />
                                        <TextInput
                                            label={index == 0 ? "Transition:" : ''}
                                            placeholder={notSpecified}
                                            {...props.form.getInputProps(
                                                `windows.${props.index}.expectedSpectralLine.${index}.transition`
                                            )}
                                        />
                                        <TextInput
                                            label={index == 0 ? "Splatalogue id:": ''}
                                            placeholder={notSpecified}
                                            {...props.form.getInputProps(
                                                `windows.${props.index}.expectedSpectralLine.${index}.splatalogId.value`
                                            )}
                                        />
                                        <TextInput
                                            label={index == 0 ? "Description:" : ''}
                                            placeholder={notSpecified}
                                            {...props.form.getInputProps(
                                                `windows.${props.index}.expectedSpectralLine.${index}.description`
                                            )}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ActionIcon
                                                color={"red.5"}
                                                onClick={() => props.form.removeListItem(
                                                    `windows.${props.index}.expectedSpectralLine`, index
                                                )}
                                            >
                                                <IconTrash size={"1rem"}/>
                                            </ActionIcon>
                                        </Box>
                                    </Group>
                                    <Space h={"xs"} />
                                </>
                            )
                        })
                        :
                        <Text c={"yellow.5"}>None specified</Text>
                }
                <Space h={"xs"} />
                <Group position={"right"}>
                    <ActionIcon
                        color={"green.5"}
                        size={"xs"}
                        onClick={() => props.form.insertListItem(
                            `windows.${props.index}.expectedSpectralLine`, {...emptySpectralLine}
                        )}
                    >
                        <IconPlus size={"1rem"}/>
                    </ActionIcon>
                </Group>

            </fieldset>
        )
    }

    const handleSubmit = props.form.onSubmit((values) => {
        console.log(values)
    })

    return(
        <form onSubmit={handleSubmit}>
            {renderWindowSetup()}
            {renderSpectralLines()}
        </form>
    )
}