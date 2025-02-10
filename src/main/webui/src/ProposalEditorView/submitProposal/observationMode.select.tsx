import {UseFormReturnType} from "@mantine/form";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {ReactElement, useEffect, useState} from "react";
import {Box, Button, ComboboxItem, Loader, Modal, ScrollArea, Select, Stack, Table, Text} from "@mantine/core";
import {
    useObservingModeResourceGetCycleObservingModes,
} from "../../generated/proposalToolComponents.ts";
import {useDisclosure} from "@mantine/hooks";
import ObservationModeDetailsSelect from "./observationMode.detials.select.tsx";
import {IconPencilPlus} from "@tabler/icons-react";
import {ICON_SIZE} from "../../constants.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


/*
    One select to choose an observation mode for all observations, and a table of the observations, each
    with an observation mode select such that different observations may have different observation modes.
 */


export default
function ObservationModeSelect(props: {
    form: UseFormReturnType<SubmissionFormValues>,
    smallScreen?: boolean
}): ReactElement {

    const [opened, {open, close}] = useDisclosure(false);

    const [observingModes, setObservingModes] = useState<{value: string, label: string}[]>([])

    const [theOneMode, setTheOneMode] = useState<ComboboxItem | null>(null);

    const cycleModes = useObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: props.form.getValues().selectedCycle}
        });

    useEffect(() => {
        if (cycleModes.status === 'success')
            setObservingModes(
                cycleModes.data.map((mode) => (
                    //in this context 'name' contains the mode description string, 'code' contains its name
                    //the description is potentially just a duplicate of the name
                    {
                        value: String(mode.dbid),
                        label: mode.code === mode.name? mode.code! : mode.code + ": " + mode.name
                    }
                ))
            )

    }, [cycleModes.status]);


    const tableHeader = () => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Observation</Table.Th>
                <Table.Th>Select the observing mode</Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const tableRow =
        (p: {modeTuple: ObservationModeTuple, index: number}) => {
        return (
            <Table.Tr key={p.modeTuple.observationId}>
                <Table.Td>{p.modeTuple.observationType + " | "  + p.modeTuple.observationName}</Table.Td>
                <Table.Td>
                    <Select
                        placeholder={"select mode"}
                        data={observingModes}
                        allowDeselect={false}
                        error={props.form.getValues().selectedModes.at(p.index)!.modeId === 0}
                        value={props.form.getValues().selectedModes.at(p.index)!.modeId.toString()}
                        onChange={(_value, option) => {
                            props.form.setFieldValue(
                                `selectedModes.${p.index}.modeId`, Number(option.value)
                            );
                            props.form.setFieldValue(
                                `selectedModes.${p.index}.modeName`, option.label
                            );
                        }}

                    />
                </Table.Td>
            </Table.Tr>
        )
    }

    if (cycleModes.isLoading) {
        return (
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (cycleModes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load available observing modes"}
                error={getErrorMessage(cycleModes.error)}
            />
        )
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title={"Create Custom Observing Mode"}
            >
                <ObservationModeDetailsSelect />
            </Modal>

            <Box
                maw={props.smallScreen ? "100%": "75%"}
                ml={props.smallScreen ? "" : "10%"}
            >
                <Stack>
                    <Select
                        placeholder={"one mode to rule them all"}
                        label={"Either choose a mode for all observations..."}
                        mx={props.smallScreen? "0" : "20%"}
                        c={"blue"}
                        data={observingModes}
                        value={theOneMode ? theOneMode.value : null}
                        onChange={(_value, option) => {
                            setTheOneMode(option);
                            props.form.setValues({
                                selectedModes: props.form.getValues().selectedModes.map(
                                    mode => ({
                                        ...mode,
                                        modeId: Number(option.value),
                                        modeName: option.label

                                    })
                                )
                            });
                        }}
                    />
                    <Text
                        size={"sm"}
                        mx={props.smallScreen ? "0" : "20%"}
                        c={"blue"}
                    >
                        ...or select them individually.
                    </Text>
                    <ScrollArea h={250}>
                        <Table.ScrollContainer minWidth={500}>
                        <Table
                            stickyHeader
                            withTableBorder
                        >
                            {tableHeader()}
                            <Table.Tbody>
                                {
                                    props.form.getValues().selectedModes.map(
                                        (modeTuple: ObservationModeTuple, index: number) => {
                                            return(tableRow({modeTuple, index}))
                                        })
                                }
                            </Table.Tbody>
                        </Table>
                        </Table.ScrollContainer>
                    </ScrollArea>
                    <Text
                        size={"sm"}
                        mx={props.smallScreen ? "0" : "20%"}
                        c={"blue"}
                    >
                        If none of the currently defined observing modes suit your needs you may create a custom a mode.
                    </Text>
                    <Button
                        onClick={open}
                        color={"orange"}
                        leftSection={<IconPencilPlus size={ICON_SIZE}/> }
                        mx={props.smallScreen ? "0" : "35%"}
                    >
                        Create custom mode
                    </Button>
                </Stack>
            </Box>
        </>
    )
}