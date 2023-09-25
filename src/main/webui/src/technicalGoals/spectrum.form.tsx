import {
    ExpectedSpectralLine,
    PolStateEnum,
    ScienceSpectralWindow,
    SpectralWindowSetup
} from "../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {Checkbox, NumberInput, Select, Switch} from "@mantine/core";


/*
    ACCORDION !!!!!!!!
 */

interface SpectralWindowValues {
    windowSetup: {
        start: number | undefined,
        end: number | undefined,
        resolution: number | undefined,
        isSkyFrequency: boolean,
        polarization: PolStateEnum | undefined
    },
    spectralLines: {
        restFrequency: number | undefined,
        transition: string | undefined,
        splatalogId: string | undefined,
        description: string | undefined
    }[]
}


export default function ViewEditSpectralWindow(spectrum: ScienceSpectralWindow) {

    let inputWindowSetup = spectrum.spectralWindowSetup;
    let inputSpectralLine = spectrum.expectedSpectralLine?.at(0);

    let initialSpectralWindowValues : SpectralWindowValues = {
        windowSetup: {
            start: inputWindowSetup ? inputWindowSetup.start?.value! : undefined,
            end: inputWindowSetup ? inputWindowSetup.end?.value! : undefined,
            resolution: inputWindowSetup ? inputWindowSetup.spectralResolution?.value! : undefined,
            isSkyFrequency: inputWindowSetup ? inputWindowSetup.isSkyFrequency! : false,
            polarization: inputWindowSetup ? inputWindowSetup.polarization! : undefined
        },
        spectralLines: [{
            restFrequency: inputSpectralLine ? inputSpectralLine.restFrequency?.value! : undefined,
            transition: inputSpectralLine ? inputSpectralLine.transition! : undefined,
            splatalogId: inputSpectralLine ? inputSpectralLine.splatalogId?.value! : undefined,
            description: inputSpectralLine ? inputSpectralLine.description! : undefined
        }]
    }

    const form = useForm<SpectralWindowValues>({
        initialValues: initialSpectralWindowValues,
        validate: {

        },
    })

    const holdInterval = (t:number) => Math.max(1000/t**2, 1);

    const renderWindowSetup = () => {
        return (
            <>
                <NumberInput
                    label={"Start:"}
                    placeholder={"not set"}
                    precision={0}
                    step={1}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('windowSetup.start')}
                />
                <NumberInput
                    label={"End:"}
                    placeholder={"not set"}
                    precision={0}
                    step={1}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('windowSetup.end')}
                />
                <NumberInput
                    label={"Spectral resolution:"}
                    placeholder={"not set"}
                    precision={0}
                    step={1}
                    min={0}
                    stepHoldDelay={500}
                    stepHoldInterval={holdInterval}
                    {...form.getInputProps('windowSetup.resolution')}
                />
                <Checkbox
                    label={"Sky frequency:"}
                    {...form.getInputProps('windowSetup.isSkyFrequency', {type: 'checkbox'})}
                />
                <Select
                    label={"Polarization:"}
                    placeholder={"pick one"}
                    data={[
                        "I","Q","U","V","RR","LL","RL","LR","XX","YY","XY","YX","PF","PP","PA"
                    ]}
                    {...form.getInputProps('windowSetup.polarization')}
                />

            </>

        )
    }

    const handleSubmit = form.onSubmit((values) => {
        console.log(values)
    })

    return(
        <form onSubmit={handleSubmit}>
            {renderWindowSetup()}
        </form>
    )
}