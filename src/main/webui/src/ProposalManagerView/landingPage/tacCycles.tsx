import {ReactElement} from "react";
import {Box, List, Table, Tooltip} from "@mantine/core";
import {
    useProposalCyclesResourceGetProposalCycleDates,
    useProposalCyclesResourceGetProposalCycles,
    useSubmittedProposalResourceGetSubmittedProposals, useTACResourceGetCommitteeMembers,
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {PanelHeader} from "../../commonPanel/appearance.tsx";
import {randomId} from "@mantine/hooks";

type CycleRowProps = {
    cycleId: number
    inReview?: boolean
}

function GetCountSubmittedProposals(props:CycleRowProps) {
    const {data, error, isLoading} = useSubmittedProposalResourceGetSubmittedProposals({pathParams:{cycleCode: props.cycleId}});

    if(error) {
        return (<pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>)
    }

    if (isLoading) {
        return (`??`);
    } else if(data?.length !== undefined && data?.length > 0) {
        return data?.length;
    } else {
        return "None";
    }
}

function GetReviewers(props:CycleRowProps) {
    const {data, error, isLoading} = useTACResourceGetCommitteeMembers({pathParams:{cycleCode: props.cycleId}});

    if(error) {
        return (<pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>)
    }

    if (isLoading) {
        return (`??`);
    } else if(data?.length !== undefined && data?.length > 0) {
        return data?.length;
    } else {
        return "None";
    }
}

function TacCycleTableRow(props:CycleRowProps) {
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

    const today = new Date();

    if(isLoading)
        return <Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>;
    else {
        const deadlineDate = new Date(data!.submissionDeadline!.substring(0,10));
        const endDate = new Date(data!.observationSessionEnd!.substring(0,10));
        //Open cycles
        if(!props.inReview && deadlineDate > today){
            return <Table.Tr><Tooltip label={tooltip}><Table.Td>{data?.observatory?.name}</Table.Td></Tooltip>
                <Table.Td>{data?.title}</Table.Td>
                {<Table.Td>{data?.submissionDeadline?.substring(0, 10)}</Table.Td>}
                <Table.Td>{data?.observationSessionStart?.substring(0, 10)}</Table.Td>
                <Table.Td>{data?.observationSessionEnd?.substring(0, 10)}</Table.Td>
                <Table.Td><GetCountSubmittedProposals cycleId={props.cycleId} /></Table.Td>
            </Table.Tr>;
        }

        //Closed cycles that haven't finished observing
        if(props.inReview
            && deadlineDate < today
            && endDate > today){
            return <Table.Tr><Tooltip label={tooltip}><Table.Td>{data?.observatory?.name}</Table.Td></Tooltip>
                <Table.Td>{data?.title}</Table.Td>
                <Table.Td>{data?.observationSessionStart?.substring(0, 10)}</Table.Td>
                <Table.Td>{data?.observationSessionEnd?.substring(0, 10)}</Table.Td>
                <Table.Td><GetCountSubmittedProposals cycleId={props.cycleId} /></Table.Td>
                <Table.Td><GetReviewers cycleId={props.cycleId} /></Table.Td>
            </Table.Tr>;
        }
    }
}

function TacCycles (): ReactElement {
    const { data , error, isLoading } = useProposalCyclesResourceGetProposalCycles({
            queryParams: {includeClosed: true}
        });

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const listOpenCycles = () => {
        if(data?.length == 0) {
            return <List key={randomId()}>There are no open proposal cycles</List>
        }
        return <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Observatory</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Deadline</Table.Th>
                    <Table.Th>Observing start</Table.Th>
                    <Table.Th>Observing end</Table.Th>
                    <Table.Th>Submitted proposals</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data?.map((cycle) => {
                    return <TacCycleTableRow key={cycle.dbid} cycleId={cycle.dbid!} inReview={false}/>;
                })}
            </Table.Tbody>
        </Table>
    };

    const listClosedCycles = () => {
        if(data?.length == 0) {
            return <List key={randomId()}>There are no closed proposal cycles</List>
        }
        return <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Observatory</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Observing start</Table.Th>
                    <Table.Th>Observing end</Table.Th>
                    <Table.Th>Submitted proposals</Table.Th>
                    <Table.Th>Assigned reviewers</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data?.map((cycle) => {
                    return <TacCycleTableRow key={cycle.dbid} cycleId={cycle.dbid!} inReview={true}/>;
                })}
            </Table.Tbody>
        </Table>
    };


    return <>
        <PanelHeader itemName={"Observing Cycles"} panelHeading={"Open"}/>
        {isLoading? 'Loading' : listOpenCycles()}
        <PanelHeader itemName={"Observing Cycles"} panelHeading={"Closed"}/>
        {isLoading? 'Loading' : listClosedCycles()}
    </>;

}

export default TacCycles