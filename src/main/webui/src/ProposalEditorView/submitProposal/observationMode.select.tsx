import {UseFormReturnType} from "@mantine/form";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {ReactElement, useEffect, useState} from "react";
import {Select, Table} from "@mantine/core";
import {
    fetchObservingModeResourceGetCycleObservingModes,
} from "../../generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


/*
    One select to choose an observation mode for all observations, and a table of the observations, each
    with an observation mode select such that different observations may have different observation modes.
 */


export default
function ObservationModeSelect(props: {form: UseFormReturnType<SubmissionFormValues>}): ReactElement {

    const [observationModes, setObservationModes] = useState<{value: string, label: string}[]>([])

    useEffect(() => {
        console.log("selected cycle: " + props.form.getValues().selectedCycle)
        fetchObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: props.form.getValues().selectedCycle}
        })
            .then((data : ObjectIdentifier[]) => {
                setObservationModes(
                    data?.map((mode) => (
                        //in this context 'code' contains the mode description string
                        {value: String(mode.dbid), label: mode.name + ": " + mode.code}
                    ))
                )
            })
            .catch((error) => {
                notifyError("Failed to load observation modes", getErrorMessage(error))
            })
    }, [props.form.getValues().selectedCycle]);

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
                        {...props.form.getInputProps(`selectedModes.${p.index}.modeId`)}
                    />
                </Table.Td>
            </Table.Tr>
        )
    }

    return (
        <Table>
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