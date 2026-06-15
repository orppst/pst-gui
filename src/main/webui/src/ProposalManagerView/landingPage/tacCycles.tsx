import {ReactElement, useContext} from "react";
import {Box, List, Table, Tooltip} from "@mantine/core";
import {
    fetchSubmittedProposalResourceGetSubmittedProposal,
    useProposalCyclesResourceGetProposalCycles,
    useProposalCyclesResourceGetMyTACMemberProposalCycles,
    useProposalCyclesResourceGetProposalCycleDetails,
    useSubmittedProposalResourceGetAssignedSubmittedProposals,
    useSubmittedProposalResourceGetSubmittedProposals,
    useTACResourceGetCommitteeMembers,
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {PanelHeader} from "../../commonPanel/appearance.tsx";
import {randomId} from "@mantine/hooks";
import {HaveRole} from "../../auth/Roles.tsx";
import {Link} from "react-router-dom";
import {ProposalContext} from "../../App2.tsx";
import {useQueries} from "@tanstack/react-query";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

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

// TODO: Change this from a count of committee members to a count of reviewers 
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
    const {data, error, isLoading} = useProposalCyclesResourceGetProposalCycleDetails(
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
            return <Table.Tr>
                <Tooltip label={tooltip}>
                    <Table.Td>{data?.observatory?.name}</Table.Td>
                </Tooltip>
                <Table.Td>{data?.title} [{data?.code}]</Table.Td>
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
            return <Table.Tr>
                <Tooltip label={tooltip}>
                    <Table.Td>{data?.observatory?.name}</Table.Td>
                </Tooltip>
                <Table.Td>{data?.title} [{data?.code}]</Table.Td>
                <Table.Td>{data?.observationSessionStart?.substring(0, 10)}</Table.Td>
                <Table.Td>{data?.observationSessionEnd?.substring(0, 10)}</Table.Td>
                <Table.Td><GetCountSubmittedProposals cycleId={props.cycleId} /></Table.Td>
                <Table.Td><GetReviewers cycleId={props.cycleId} /></Table.Td>
            </Table.Tr>;
        }
    }
}

function ReviewerCycleTableRow(props: CycleRowProps): ReactElement {
    const {user} = useContext(ProposalContext);
    const reviewerId = user._id;
    const {fetcherOptions} = useProposalToolContext();

    const cycleDetails = useProposalCyclesResourceGetProposalCycleDetails(
        {pathParams: {cycleCode: props.cycleId}}
    );

    const assignedProposals = useSubmittedProposalResourceGetAssignedSubmittedProposals({
        pathParams: {cycleCode: props.cycleId, personId: reviewerId ?? 0}
    }, {enabled: reviewerId !== undefined});

    const detailedAssignedProposals = useQueries({
        queries: (assignedProposals.data ?? []).map((proposal) => ({
            queryKey: ["reviewer-assigned-proposal", props.cycleId, proposal.dbid],
            queryFn: () =>
                fetchSubmittedProposalResourceGetSubmittedProposal({
                    ...fetcherOptions,
                    pathParams: {
                        cycleCode: props.cycleId,
                        submittedProposalId: proposal.dbid ?? 0
                    }
                }),
            enabled: proposal.dbid !== undefined
        }))
    });

    if(!reviewerId) {
        return (
            <Table.Tr>
                <Table.Td colSpan={5}>Unable to load reviewer details</Table.Td>
            </Table.Tr>
        )
    }

    if(cycleDetails.isLoading || assignedProposals.isLoading || detailedAssignedProposals.some(proposal => proposal.isLoading)) {
        return <Table.Tr><Table.Td colSpan={5}>Loading...</Table.Td></Table.Tr>
    }

    if(cycleDetails.error || assignedProposals.error || detailedAssignedProposals.some(proposal => proposal.error)) {
        return (
            <Table.Tr>
                <Table.Td colSpan={5}>Error loading review data</Table.Td>
            </Table.Tr>
        )
    }

    const assignedCount = assignedProposals.data?.length ?? 0;

    const pendingReviewsCount = detailedAssignedProposals.filter((proposal) => {
        if(!proposal.data) {
            return false;
        }
        const yourReview = proposal.data.reviews?.find(
            review => review.reviewer?._id === reviewerId
        );
        return !yourReview || !yourReview.reviewDate;
    }).length;

    return (
        <Table.Tr>
            <Table.Td>{cycleDetails.data?.observatory?.name}</Table.Td>
            <Table.Td>{cycleDetails.data?.title} [{cycleDetails.data?.code}]</Table.Td>
            <Table.Td>{assignedCount}</Table.Td>
            <Table.Td>{pendingReviewsCount}</Table.Td>
            <Table.Td>
                <Link to={`/manager/cycle/${props.cycleId}/reviews`}>
                    Go to reviews
                </Link>
            </Table.Td>
        </Table.Tr>
    )
}

function ReviewerCycles() : ReactElement {
    const {data, error, isLoading} = useProposalCyclesResourceGetProposalCycles(
        {queryParams: {includeClosed: true}}
    );
    const reviewerCycles = data?.filter(cycle => cycle.dbid !== undefined) ?? [];

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    return <>
        <PanelHeader itemName={"Review Proposals"} panelHeading={"Your Assigned Reviews"} />
        {isLoading ? "Loading" :
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Observatory</Table.Th>
                        <Table.Th>Name [code]</Table.Th>
                        <Table.Th>Assigned proposals</Table.Th>
                        <Table.Th>Outstanding reviews</Table.Th>
                        <Table.Th>Link</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {reviewerCycles.map(cycle => (
                        <ReviewerCycleTableRow key={cycle.dbid} cycleId={Number(cycle.dbid)} />
                    ))}
                </Table.Tbody>
            </Table>
        }
    </>
}

function TacMemberCycles (): ReactElement {
    const { data , error, isLoading } = useProposalCyclesResourceGetMyTACMemberProposalCycles(
        {queryParams: {includeClosed: true}}
    );

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
                    <Table.Th>Name [code]</Table.Th>
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
                    <Table.Th>Name [code]</Table.Th>
                    <Table.Th>Observing start</Table.Th>
                    <Table.Th>Observing end</Table.Th>
                    <Table.Th>Submitted proposals</Table.Th>
                    <Table.Th>TAC members</Table.Th>
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

function TacCycles (): ReactElement {
    if(HaveRole(["tac_admin", "tac_member"])) {
        return <TacMemberCycles />
    }

    if(HaveRole(["reviewer"])) {
        return <ReviewerCycles />
    }

    return <>Not authorised</>
}

export default TacCycles