import {UseFormReturnType} from "@mantine/form";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {ReactElement, useEffect, useState} from "react";
import {Box, ComboboxItem, Fieldset, Loader, ScrollArea, Select, Stack, Table, Text} from "@mantine/core";
import {
    useObservingModeResourceGetCycleObservingModes, useProposalCyclesResourceGetProposalCycleObservatory,
} from "../../generated/proposalToolComponents.ts";
import ObservationModeDetails from "./observationModeDetails.tsx";
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

    const [observingModes, setObservingModes] = useState<{value: string, label: string}[]>([])

    const [theOneMode, setTheOneMode] = useState<ComboboxItem | null>(null);

    const cycleModes = useObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: props.form.getValues().selectedCycle}
        });

    const observatory = useProposalCyclesResourceGetProposalCycleObservatory({
        pathParams: {cycleCode: props.form.getValues().selectedCycle}
    })

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
            <Table.Tr key={p.modeTuple.observationId + p.modeTuple.observationName}>
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

    if (cycleModes.isLoading || observatory.isLoading) {
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

    if (observatory.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load the associated observatory"}
                error={getErrorMessage(observatory.error)}
            />
        )
    }

    return (
        <>
            <Box
                maw={props.smallScreen ? "100%": "75%"}
                ml={props.smallScreen ? "" : "10%"}
            >
                <Stack>
                    <Select
                        placeholder={"one mode to rule them all"}
                        label={"Select a mode for ALL observations (displays details on selection)..."}
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
                    {
                        theOneMode &&
                        <Fieldset legend={"Observing Mode Details"} >
                            <ObservationModeDetails
                                observatoryId={observatory.data?._id!}
                                observingModeId={Number(theOneMode?.value)}
                                selectedCycleId={props.form.getValues().selectedCycle}
                            />
                        </Fieldset>
                    }
                    <Text
                        size={"sm"}
                        mx={props.smallScreen ? "0" : "20%"}
                        c={"blue"}
                    >
                        ...or select them individually.
                    </Text>
                    <ScrollArea.Autosize mah={250} >
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
                    </ScrollArea.Autosize>
                </Stack>
            </Box>
        </>
    )
}