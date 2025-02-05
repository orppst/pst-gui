import {UseFormReturnType} from "@mantine/form";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {ReactElement, useEffect, useState} from "react";
import {Box, Button, Modal, ScrollArea, Select, Stack, Table, Text} from "@mantine/core";
import {
    useObservingModeResourceGetCycleObservingModes,
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useDisclosure} from "@mantine/hooks";
import ObservationModeDetailsSelect from "./observationMode.detials.select.tsx";
import {IconPencilPlus} from "@tabler/icons-react";
import {ICON_SIZE} from "../../constants.tsx";


/*
    One select to choose an observation mode for all observations, and a table of the observations, each
    with an observation mode select such that different observations may have different observation modes.
 */


export default
function ObservationModeSelect(props: { form: UseFormReturnType<SubmissionFormValues> }): ReactElement {

    const [opened, { open, close}] = useDisclosure(false);

    const [observationModes, setObservationModes] = useState<{value: string, label: string}[]>([])

    const {data, status, error} = useObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: props.form.getValues().selectedCycle}
        });

    useEffect(() => {
        if (error)
            notifyError("Failed to load observation modes", getErrorMessage(error))
        else
            if(data !== undefined)
                setObservationModes(
                    data.map((mode) => (
                        //in this context 'name' contains the mode description string
                        {value: String(mode.dbid), label: mode.code + ": " + mode.name}
                    ))
                )

    }, [status]);

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
                        data={observationModes}
                        allowDeselect={false}
                        {...props.form.getInputProps(`selectedModes.${p.index}.modeId`)}
                    />
                </Table.Td>
            </Table.Tr>
        )
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title={"ARGGGGHHHH!!!"}
            >
                <ObservationModeDetailsSelect />
            </Modal>



            <Box maw={"75%"} ml={"10%"}>
                <Stack>
                    <Select
                        mx={"20%"}
                        c={"blue"}
                        label={"Either choose a mode for all observations..."}
                        description={"One mode to rule them all"}

                    />
                    <Text size={"sm"} mx={"20%"} c={"blue"}>
                        ...or select them individually.
                    </Text>
                    <ScrollArea h={250}>
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
                    </ScrollArea>
                    <Text size={"sm"} mx={"15%"} c={"blue"}>
                        If none of the currently defined observing modes suit your needs you may create a custom a mode.
                    </Text>
                    <Button
                        onClick={open}
                        color={"grape"}
                        leftSection={<IconPencilPlus size={ICON_SIZE}/> }
                        mx={"30%"}
                    >
                        Create custom mode
                    </Button>
                </Stack>
            </Box>
        </>
    )
}