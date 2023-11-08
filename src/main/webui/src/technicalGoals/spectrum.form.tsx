import {
    Accordion, Badge,
    Checkbox,
    Fieldset, Grid,
    Group,
    Select,
} from "@mantine/core";
import {TechnicalGoalValues} from "./edit.group.tsx";
import AddButton from "../commonButtons/add.tsx";
import {UseFormReturnType} from "@mantine/form";
import {AccordionDelete} from "../commonButtons/accordianControls.tsx";
import {frequencyUnits} from "../physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit} from "../commonInputs/NumberInputPlusUnit.tsx";
import {randomId} from "@mantine/hooks";
import {ScienceSpectralWindowGui} from "./scienceSpectralWindowGui.tsx";
import {ReactElement} from "react";


export default function SpectralWindowsSection(
    form: UseFormReturnType<TechnicalGoalValues>
): ReactElement {

    const EMPTY_SPECTRAL_WINDOW : ScienceSpectralWindowGui = {
        index: "",
        start: {value: "", unit: ""},
        end: {value: "", unit: ""},
        spectralResolution: {value: "", unit: ""},
        isSkyFrequency: false,
        polarization: undefined,
        expectedSpectralLines:[],
        key: randomId()
    }

    const renderWindowSetup = (index: number) => {
        const TOTAL_COLUMNS = 16;

        //spans work out the proportional amount of space for each element and
        //provide the responsiveness in terms of view-port width

        return (
            <Grid columns={TOTAL_COLUMNS} gutter={0}>
                <Grid.Col span={{base: TOTAL_COLUMNS, xl: TOTAL_COLUMNS/4}}>
                    <NumberInputPlusUnit
                        color={"cyan"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"Start"}
                        valueRoot={`windows.${index}.start`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS, xl: TOTAL_COLUMNS/4}}>
                    <NumberInputPlusUnit
                        color={"indigo"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"End"}
                        valueRoot={`windows.${index}.end`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS, xl: TOTAL_COLUMNS/4}}>
                    <NumberInputPlusUnit
                        color={"violet"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"Resolution"}
                        valueRoot={`windows.${index}.spectralResolution`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS/2, xl: TOTAL_COLUMNS/2/4}}>
                    <Select
                        label={"Polarization:"}
                        placeholder={"pick one"}
                        px={5}
                        data={[
                            "I","Q","U","V","RR","LL","RL","LR","XX","YY","XY","YX","PF","PP","PA"
                        ]}
                        {...form.getInputProps(`windows.${index}.polarization`)}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS/2, xl: TOTAL_COLUMNS/2/4}}>
                    <Group justify={"center"}>
                        <Checkbox
                            size={"sm"}
                            label={"sky frequency"}
                            pt={25}
                            {...form.getInputProps(`windows.${index}.isSkyFrequency`,
                                {type: 'checkbox'})}
                        />
                    </Group>
                </Grid.Col>
            </Grid>
        )
    }

    const renderSpectralLines = () => {
        return (
            <Fieldset legend={"Spectral lines"}>
                <Badge radius={0} color={"red"}>
                    WIP: provide a selectable list of potential spectral lines given the spectral range above
                </Badge>
            </Fieldset>
        )
    }

    /**
     * handles the deletion of a timing window.
     *
     * @param {number} index the index in the table.
     */
    const handleDelete = (index: number) => {
        alert("Removes the list item only - " +
            "does not yet delete the spectral window from the database")
        form.removeListItem('spectralWindows', index);
        //todo: call API function to delete timing window from the database
    }

    const windowsList = form.values.spectralWindows.map(
        (s, mapIndex) => {
        let labelIndex = (mapIndex + 1).toString();
        return (
            <Accordion.Item value={labelIndex} key={s.key}>
                <AccordionDelete
                    title={"Window " + labelIndex}
                    deleteProps={{
                        toolTipLabel: "remove spectral window " + labelIndex,
                        onClick: () => handleDelete(mapIndex)
                    }}
                />
                <Accordion.Panel>
                    {renderWindowSetup(mapIndex)}
                    {renderSpectralLines()}
                </Accordion.Panel>
            </Accordion.Item>
        )
    })

    return(
        <Fieldset legend={"Spectral windows"}>
            <Accordion defaultValue={"1"} chevronPosition={"left"}>
                {windowsList}
            </Accordion>
            <Group justify={"flex-end"}>
                <AddButton
                    toolTipLabel={"add a spectral window"}
                    onClick={() => form.insertListItem(
                        'windows',
                        {...EMPTY_SPECTRAL_WINDOW, key: randomId()}
                    )}
                />
            </Group>
        </Fieldset>
    )
}