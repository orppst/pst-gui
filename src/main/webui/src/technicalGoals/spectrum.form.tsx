import {Checkbox, Group, NumberInput, Select, TextInput} from "@mantine/core";
import {ScienceSpectrumProps} from "./parent.form.tsx";

export default function ViewEditSpectralWindow(props: ScienceSpectrumProps) {

    const precision = 3;
    const step = 0.001;


    const renderWindowSetup = () => {
        return (
            <Group grow>
                <NumberInput
                    label={"Start:"}
                    placeholder={"not set"}
                    precision={precision}
                    step={step}
                    min={0}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.start.value`)}
                />
                <NumberInput
                    label={"End:"}
                    placeholder={"not set"}
                    precision={precision}
                    step={step}
                    min={0}
                    {...props.form.getInputProps(`windows.${props.index}.spectralWindowSetup.end.value`)}
                />
                <NumberInput
                    label={"Spectral resolution:"}
                    placeholder={"not set"}
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
        return (
            <>
                {
                    props.form.values.windows?.at(props.index)?.expectedSpectralLine?.map((s, index) => {
                        return (
                            <Group>
                                <NumberInput
                                    label={"Rest frequency:"}
                                    placeholder={"not set"}
                                    defaultValue={s?.restFrequency?.value}
                                    precision={precision}
                                    step={step}
                                    min={0}
                                    {...props.form.getInputProps(
                                        `windows.${props.index}.expectedSpectralLine.${index}.restFrequency.value`
                                    )}
                                />
                                <TextInput
                                    label={"Transition"}
                                    placeholder={"not set"}
                                    defaultValue={s?.transition}
                                    {...props.form.getInputProps(
                                        `windows.${props.index}.expectedSpectralLine.${index}.transition`
                                    )}
                                />
                                <TextInput
                                    label={"Splatalogue id:"}
                                    placeholder={"not set"}
                                    defaultValue={s?.splatalogId?.value}
                                    {...props.form.getInputProps(
                                        `windows.${props.index}.expectedSpectralLine.${index}.splatalogId.value`
                                    )}
                                />
                                <TextInput
                                    label={"Description:"}
                                    placeholder={"not set"}
                                    defaultValue={s?.description}
                                    {...props.form.getInputProps(
                                        `windows.${props.index}.expectedSpectralLine.${index}.description`
                                    )}
                                />
                            </Group>
                        )
                    })
                }

            </>
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