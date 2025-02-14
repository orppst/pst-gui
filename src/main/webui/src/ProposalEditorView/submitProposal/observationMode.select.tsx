import {UseFormReturnType} from "@mantine/form";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {ReactElement, useEffect, useState} from "react";
import {Box, Fieldset, Loader, ScrollArea, Select, Stack, Table} from "@mantine/core";
import {
    useObservingModeResourceGetCycleObservingModes,
    useObservingModeResourceGetObservingModesFilters,
    useProposalCyclesResourceGetProposalCycleObservatory,
} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ObservationModeDetailsShow from "./observationModeDetailsShow.tsx";
import ObservationModeDetailsSelect from "./observationModeDetailsSelect.tsx";


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

    const cycleModes = useObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: props.form.getValues().selectedCycle}
        });

    const observatory = useProposalCyclesResourceGetProposalCycleObservatory({
        pathParams: {cycleCode: props.form.getValues().selectedCycle}
    })

    const allFilters = useObservingModeResourceGetObservingModesFilters({
        pathParams: {cycleId: props.form.getValues().selectedCycle}
    })

    useEffect(() => {
        if (cycleModes.status === 'success') {
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
        }
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
                        allowDeselect={false}
                        placeholder={"select mode"}
                        data={observingModes}
                        error={props.form.getValues().selectedModes.at(p.index)!.modeId === 0}
                        value={props.form.getValues().selectedModes.at(p.index)!.modeId.toString()}
                        onChange={(_value, option) => {
                            //console.log("option: " +  option.value + ":" + option.label)
                            props.form.setFieldValue(
                                `selectedModes.${p.index}.modeId`, option ? Number(option.value) : 0
                            );
                            props.form.setFieldValue(
                                `selectedModes.${p.index}.modeName`, option ? option.label : ""
                            );
                        }}

                    />
                </Table.Td>
            </Table.Tr>
        )
    }

    if (cycleModes.isLoading || observatory.isLoading || allFilters.isLoading) {
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

    if (allFilters.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load the mode filters"}
                error={getErrorMessage(allFilters.error)}
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
                    <Fieldset legend={"Observing Mode Details"} >
                        {
                            cycleModes.data && cycleModes.data?.length > 5 ?
                                <ObservationModeDetailsSelect/> :
                                <ObservationModeDetailsShow
                                    form={props.form}
                                    allModes={ cycleModes.data!.map((mode) => (
                                        {
                                            value: String(mode.dbid),
                                            label: mode.code === mode.name? mode.code! : mode.code + ": " + mode.name
                                        }
                                    ))}
                                    observatoryId={observatory.data?._id!}
                                />
                        }
                    </Fieldset>
                    <ScrollArea.Autosize mah={250} >
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
                    </ScrollArea.Autosize>
                </Stack>
            </Box>
        </>
    )
}

