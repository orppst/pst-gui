import {ReactElement} from "react";
import {Box, List, Table, Tooltip} from "@mantine/core";
import {
    useProposalCyclesResourceGetProposalCycleDates, useProposalCyclesResourceGetProposalCycles,
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {randomId} from "@mantine/hooks";

type CycleRowProps = {
    cycleId: number
}

function ProposalCycleTableRow(props:CycleRowProps) {
    const {data, error, isLoading} = useProposalCyclesResourceGetProposalCycleDates(
        {pathParams: {cycleCode: props.cycleId}});

    const tooltip = data?.observatory?.telescopes?.length + " telescopes";

    if (error) {
        return (
            <Table.Tr><Table.Td>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Table.Td></Table.Tr>
        );
    }

    if(isLoading)
        return <Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>;
    else
        return <Table.Tr><Tooltip label={tooltip}><Table.Td>{data?.observatory?.name}</Table.Td></Tooltip>
            <Table.Td>{data?.title}</Table.Td>
            <Table.Td>{data?.submissionDeadline?.substring(0,10)}</Table.Td>
            <Table.Td>{data?.observationSessionStart?.substring(0,10)}</Table.Td>
            <Table.Td>{data?.observationSessionEnd?.substring(0,10)}</Table.Td>
        </Table.Tr>;
}


function ObservatoriesCyclesPanel (): ReactElement {
    const { data , error, isLoading } = useProposalCyclesResourceGetProposalCycles({queryParams: {}});

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const listCycles = () => {
        if(data?.length == 0) {
            return <List key={randomId()}>There are no proposal cycles currently available</List>
        }
        return <Table>
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
            {data?.map((cycle) => {
                return <ProposalCycleTableRow key={cycle.dbid} cycleId={cycle.dbid!} />;
            })}
        </Table.Tbody>
        </Table>
    };


    return (
        <>
            {isLoading? 'Loading' : listCycles()}
        </>
    )

}

export default ObservatoriesCyclesPanel