import {ReactElement} from "react";
import {List, Loader, Table, Tooltip} from "@mantine/core";
import {
    useProposalCyclesResourceGetProposalCycleDates,
} from "../../generated/proposalToolComponents.ts";
import {randomId} from "@mantine/hooks";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import TextErrorMessage from "../../errorHandling/textErrorMessage.tsx";

type CycleRowProps = {
    cycleId: number
}

function ProposalCycleTableRow(props:CycleRowProps) {
    const cycleDates = useProposalCyclesResourceGetProposalCycleDates(
        {pathParams: {cycleCode: props.cycleId}});

    const tooltip = cycleDates.data?.observatory?.telescopes?.length + " telescopes";

    if (cycleDates.isError) {
        return (
            <Table.Tr>
                <Table.Td>
                    <TextErrorMessage error={cycleDates.error} preamble={"Failed to load dates"}/>
                </Table.Td>
            </Table.Tr>
        );
    }

    if(cycleDates.isLoading) {
        return (
            <Table.Tr>
                <Table.Td>
                    <Loader size={"sm"} />
                </Table.Td>
            </Table.Tr>
        )
    }

    return (
        <Table.Tr>
            <Tooltip label={tooltip}>
                <Table.Td>
                    {cycleDates.data?.observatory?.name}
                </Table.Td>
            </Tooltip>
            <Table.Td>
                {cycleDates.data?.title}
            </Table.Td>
            <Table.Td>
                {cycleDates.data?.submissionDeadline?.substring(0,10)}
            </Table.Td>
            <Table.Td>
                {cycleDates.data?.observationSessionStart?.substring(0,10)}
            </Table.Td>
            <Table.Td>
                {cycleDates.data?.observationSessionEnd?.substring(0,10)}
            </Table.Td>
        </Table.Tr>
    )

}

export default
function ObservatoriesCyclesPanel (props: {cycles: ObjectIdentifier[]}): ReactElement {

    const listCycles = () => {
        if(props.cycles.length == 0) {
            return <List key={randomId()}>There are no proposal cycles currently available</List>
        }
        return (
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Observatory</Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Deadline</Table.Th>
                        <Table.Th>Observing start</Table.Th>
                        <Table.Th>Observing end</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {props.cycles.map((cycle) => {
                        return <ProposalCycleTableRow key={cycle.dbid} cycleId={cycle.dbid!} />;
                    })}
                </Table.Tbody>
            </Table>
        )
    };

    return listCycles()
}
