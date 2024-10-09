import {
    Accordion, Badge,
    Checkbox,
    Fieldset, Grid,
    Group,
    Select, useMantineColorScheme,
    Text
} from "@mantine/core";
import {TechnicalGoalValues} from "./edit.group.tsx";
import AddButton from "src/commonButtons/add.tsx";
import {UseFormReturnType} from "@mantine/form";
import {AccordionRemove} from "src/commonButtons/accordianControls.tsx";
import {frequencyUnits} from "src/physicalUnits/PhysicalUnits.tsx";
import {NumberInputPlusUnit} from "src/commonInputs/NumberInputPlusUnit.tsx";
import {randomId} from "@mantine/hooks";
import {ScienceSpectralWindowGui} from "./scienceSpectralWindowGui.tsx";
import {ReactElement} from "react";
import { MAX_COLUMNS } from 'src/constants';
import {modals} from "@mantine/modals";
import {fetchTechnicalGoalResourceRemoveSpectrum} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";

/**
 * generates the spectral window panel.
 *
 * @param {UseFormReturnType<TechnicalGoalValues>} form the form containing the spectral windows.
 * @return {React.ReactElement} the dynamic html for the spectral window panel.
 * @constructor
 */
export default function SpectralWindowsSection(
    {form}: {form: UseFormReturnType<TechnicalGoalValues>}
): ReactElement {

    //stuff to deal with spectral window deletions
    const { selectedProposalCode} = useParams();
    const queryClient = useQueryClient();

    // determine color.
    const {colorScheme} = useMantineColorScheme();
    const IS_LIGHT = colorScheme === 'light'

    // default window settings.
    const EMPTY_SPECTRAL_WINDOW : ScienceSpectralWindowGui = {
        start: {value: "", unit: null},
        end: {value: "", unit: null},
        spectralResolution: {value: "", unit: null},
        isSkyFrequency: false,
        polarization: null,
        expectedSpectralLines:[],
        key: randomId(),
        id: 0
    }

    /**
     * builds a window setup panel.
     *
     * @param {number} index the window array index.
     * @return {ReactElement} the dynamic html for the window.
     */
    const renderWindowSetup = (index: number): ReactElement => {
        const TOTAL_COLUMNS = MAX_COLUMNS;

        //spans work out the proportional amount of space for each element and
        //provide responsiveness in terms of view-port width
        return (
            <Grid columns={TOTAL_COLUMNS} gutter={0}>
                <Grid.Col span={{base: TOTAL_COLUMNS, xl: TOTAL_COLUMNS / 4}}>
                    <NumberInputPlusUnit
                        color={IS_LIGHT ? "teal.3" :"teal.7"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"Start"}
                        valueRoot={`spectralWindows.${index}.start`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS, xl: TOTAL_COLUMNS/4}}>
                    <NumberInputPlusUnit
                        color={IS_LIGHT ? "indigo.3" :"indigo.7"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"End"}
                        valueRoot={`spectralWindows.${index}.end`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS, xl: TOTAL_COLUMNS/4}}>
                    <NumberInputPlusUnit
                        color={IS_LIGHT ? "violet.3" :"violet.7"}
                        gap={0}
                        padding={5}
                        form={form}
                        label={"Resolution"}
                        valueRoot={`spectralWindows.${index}.spectralResolution`}
                        units={frequencyUnits}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS/2, xl: TOTAL_COLUMNS/2/4}}>
                    <Select
                        label={"Polarization:"}
                        placeholder={"pick one"}
                        px={5}
                        pt={5}
                        data={[
                            "I","Q","U","V","RR","LL","RL","LR","XX","YY","XY","YX","PF","PP","PA"
                        ]}
                        {...form.getInputProps(
                            `spectralWindows.${index}.polarization`)}
                    />
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS/2, xl: TOTAL_COLUMNS/2/4}}>
                    <Group justify={"center"}>
                        <Checkbox
                            size={"sm"}
                            label={"sky frequency"}
                            pt={35}
                            {...form.getInputProps(
                                `spectralWindows.${index}.isSkyFrequency`,
                                {type: 'checkbox'})}
                        />
                    </Group>
                </Grid.Col>
            </Grid>
        )
    }

    /**
     * renders the spectral lines.
     *
     * @return {ReactElement} the dynamic html for the spectral lines.
     */
    const renderSpectralLines = (): ReactElement => {
        return (
            <Fieldset legend={"Spectral lines"}>
                <Badge radius={0} color={"red"}>
                    WIP: select predetermined spectral lines
                </Badge>
            </Fieldset>
        )
    }

    /**
     * handles the deletion of a timing window.
     *
     * @param {number} spectralWindowId the index in the table.
     */
    const handleDelete = (spectralWindowId: number): void => {
        //existing spectral window - remove it from the database
        fetchTechnicalGoalResourceRemoveSpectrum({
            pathParams: {
                proposalCode: Number(selectedProposalCode),
                technicalGoalId: form.getValues().technicalGoalId!,
                spectralWindowId: spectralWindowId
            }
        })
            .then(()=>queryClient.invalidateQueries())
            .then(()=> notifySuccess("Deletion successful",
                    "The selected spectral window has been deleted"))
            .catch(console.error)
    }

    const confirmDeletion = (index: number, spectralWindowId: number) =>
        modals.openConfirmModal({
            title: 'Delete Spectral Window?',
            children: (
                <Text c={"yellow"} size={"sm"}>
                    Removes Spectral Window {index + 1} from the Technical Goal
                </Text>
            ),
            labels: {confirm: 'Delete', cancel: "No don't delete it"},
            confirmProps: {color: 'red'},
            onConfirm: () => handleDelete(spectralWindowId),
            onCancel: () => notifyInfo("Deletion cancelled",
                    "User cancelled deletion of the spectral window")
        })

    const windowsList = form.getValues().spectralWindows.map(
        (sw, mapIndex) => {
        let labelIndex = (mapIndex + 1).toString();
        return (
            <Accordion.Item value={labelIndex} key={sw.key}>
                <AccordionRemove
                    title={"Window " + labelIndex}
                    removeProps={{
                        toolTipLabel: "remove spectral window " + labelIndex,
                        onClick: () => {
                            sw.id === 0 ? form.removeListItem('spectralWindows', mapIndex) :
                                confirmDeletion(mapIndex, sw.id);
                        }
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
            <Group justify={"center"}>
                <AddButton
                    toolTipLabel={"add a spectral window"}
                    onClick={() => form.insertListItem(
                        'spectralWindows',
                        {...EMPTY_SPECTRAL_WINDOW, key: randomId()}
                    )}
                />
            </Group>
        </Fieldset>
    )
}