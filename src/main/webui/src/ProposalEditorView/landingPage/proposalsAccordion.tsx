import {ReactElement} from "react";
import {Accordion, Button, Fieldset, Grid, Group, ScrollArea, Stack, Table, Text, Tooltip} from "@mantine/core";
import {ObjectIdentifier, ProposalSynopsis} from "../../generated/proposalToolSchemas.ts";
import {
    useSubmittedProposalResourceGetSubmittedProposals,
    useUserProposalsSubmittedWithdrawProposal
} from "../../generated/proposalToolComponents.ts";
import {modals} from "@mantine/modals";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";

function CycleSubmissionDetail(props: {
        cycle: ObjectIdentifier,
        investigatorName: string | undefined,
        proposalTitle: string | undefined,
        sourceProposalId: number | undefined,
        isClosed: boolean,
    }):  ReactElement | ReactElement[] {


    const submittedProposals =
        useSubmittedProposalResourceGetSubmittedProposals({
            pathParams: {cycleCode: props.cycle.dbid!},
            //find exact proposal id
            queryParams: {sourceProposalId: props.sourceProposalId},
        });

    return(
        submittedProposals.isLoading ?
            <Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>
            : submittedProposals.data == undefined ?
                <Table.Tr><Table.Td>Empty!</Table.Td></Table.Tr>
            : submittedProposals.data.map((submission) => {
                return(
                    <CycleSubmissionRow
                        key={submission.dbid}
                        submittedProposalId={submission.dbid!}
                        cycle={props.cycle}
                        investigatorName={props.investigatorName}
                        submissionDate={submission.code}
                        proposalTitle={props.proposalTitle}
                        sourceProposalId={props.sourceProposalId}
                        isClosed={props.isClosed}
                    />)})
    )

}

export default
function ProposalsAccordion(
    props: {proposals: ProposalSynopsis[],
        openCycles: ObjectIdentifier[],
        allCycles: ObjectIdentifier[],
        investigatorName: string})
    : ReactElement {

    const proposalSummary = (summary: string) => {
        return (
            <Fieldset legend={"Summary"}>
                <ScrollArea.Autosize mah={250} mx={"auto"}>
                    {summary}
                </ScrollArea.Autosize>
            </Fieldset>
        )
    }

    const proposalDetails = (proposal: ProposalSynopsis)  => {
        return (
            <Accordion.Item
                value={String(proposal.code)}
                key={proposal.code}
            >
                <Accordion.Control>
                    <Group>
                        <Text c={"yellow.6"}>
                            {'\"' + proposal.title + '\"'}
                        </Text>
                        <Text>
                            {proposal.kind}
                        </Text>
                    </Group>
                </Accordion.Control>
                <Accordion.Panel>
                    <Grid columns={8}>
                        <Grid.Col span={4}>
                            {proposalSummary(proposal.summary!)}
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Table withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Submitted to:</Table.Th>
                                        <Table.Th>Submission date</Table.Th>
                                        <Table.Th>Action</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {
                                        props.allCycles.map((cycle) => {
                                            return(
                                                <CycleSubmissionDetail
                                                    key={cycle.dbid}
                                                    cycle={cycle}
                                                    investigatorName={props.investigatorName}
                                                    proposalTitle={proposal.title}
                                                    sourceProposalId={proposal.code}
                                                    isClosed={props.openCycles.find((os) => os.dbid === cycle.dbid) === undefined}
                                                />
                                            )
                                        })
                                    }
                                </Table.Tbody>
                            </Table>
                        </Grid.Col>
                    </Grid>
                </Accordion.Panel>
            </Accordion.Item>
        )
    }

    return (
        props.proposals.length === 0 ?
            <Text>Please create a proposal</Text>
            :
            <Accordion variant={"contained"}>
                {props.proposals.map(proposal => (proposalDetails(proposal)))}
            </Accordion>
    )
}

function CycleSubmissionRow(props: {
    cycle: ObjectIdentifier,
    submittedProposalId: number,
    submissionDate: string | undefined,
    investigatorName: string | undefined,
    proposalTitle: string | undefined,
    sourceProposalId: number | undefined,
    isClosed: boolean | undefined,
}):  ReactElement {
    const queryClient = useQueryClient();

    const submissionMutation =
        useUserProposalsSubmittedWithdrawProposal();

    const confirmWithdrawal = () => {
        modals.openConfirmModal({
            title: "Please confirm action",
            centered: true,
            children: (
                <Stack>
                    <Text c={"yellow"}>
                        This action will withdraw '{props.proposalTitle}' from '{props.cycle.name}'.
                        Are you sure?
                    </Text>
                    <Text c={"grey"}>
                        You may re-submit this proposal at any time up to the submission deadline.
                    </Text>
                </Stack>

            ),
            labels: {confirm: "Yes, withdraw the proposal", cancel: "Cancel this action"},
            confirmProps: {color: "blue"},
            onConfirm: () => handleWithdrawal()
        })
    }

    const handleWithdrawal = () => {
        submissionMutation.mutate({
            pathParams: {submittedProposalId: props.submittedProposalId!},
            queryParams: {cycleId: props.cycle.dbid!}
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().finally(() =>
                    notifySuccess(
                        "Withdrawn",
                        "'" + props.proposalTitle + "' has been withdrawn from '" + props.cycle.name + "'."
                    ));
            },
            onError: (error) =>
                notifyError("Withdraw Fail", getErrorMessage(error))
        })

    }

    return (<Table.Tr>
                <Table.Td>{props.cycle.name}</Table.Td>
                <Table.Td>{props.submissionDate}</Table.Td>
                <Table.Td>
                    <Tooltip
                        label={props.isClosed?"Cycle closed":"Withdraw this proposal from " + props.cycle.name}
                    >
                        <Button
                            variant={"outline"}
                            disabled={props.isClosed}
                            size={"xs"}
                            onClick={() => confirmWithdrawal()}
                        >
                            Withdraw
                        </Button>
                    </Tooltip>
                </Table.Td>
            </Table.Tr>);

}

