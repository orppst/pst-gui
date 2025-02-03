import {UseFormReturnType} from "@mantine/form";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {ReactElement, useEffect, useState} from "react";
import {Select, Table} from "@mantine/core";
import {
    useObservingModeResourceGetCycleObservingModes,
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


/*
    One select to choose an observation mode for all observations, and a table of the observations, each
    with an observation mode select such that different observations may have different observation modes.
 */


export default
function ObservationModeSelect(props: { form: UseFormReturnType<SubmissionFormValues> }): ReactElement {

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
        <Table stickyHeader>
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
    )
}