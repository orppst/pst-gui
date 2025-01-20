import {ReactElement, useEffect, useState} from "react";
import {Accordion, Button, Fieldset, Grid, Group, ScrollArea, Stack, Table, Text, Tooltip} from "@mantine/core";
import {ObjectIdentifier, ProposalSynopsis} from "../../generated/proposalToolSchemas.ts";
import {
    fetchSubmittedProposalResourceGetSubmittedProposals,
    fetchUserProposalsSubmittedWithdrawProposal,
    UserProposalsSubmittedWithdrawProposalVariables
} from "../../generated/proposalToolComponents.ts";
import {modals} from "@mantine/modals";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useToken} from "../../App2.tsx";
import {useQueryClient} from "@tanstack/react-query";

type SubmissionDetail = {
    cycleName: string,
    submissionDate: string,
    submittedProposalId: number,
}

export default
function ProposalsAccordion(
    props: {proposals: ProposalSynopsis[], cycles: ObjectIdentifier[], investigatorName: string})
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
                                        props.cycles.map((cycle) => {
                                            return(
                                                <CycleSubmissionDetail
                                                    key={cycle.dbid}
                                                    cycle={cycle}
                                                    investigatorName={props.investigatorName}
                                                    proposalTitle={proposal.title!}
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

function CycleSubmissionDetail(props: {
    cycle: ObjectIdentifier,
    investigatorName: string,
    proposalTitle: string
}):  ReactElement {
    const token = useToken();

    const queryClient = useQueryClient();

    const [submissionDetail, setSubmissionDetail] =
        useState<SubmissionDetail | null> (null);

    useEffect(() => {
        fetchSubmittedProposalResourceGetSubmittedProposals({
            pathParams: {cycleCode: props.cycle.dbid!},
            //find exact proposal title and investigator name
            queryParams: {title: props.proposalTitle, investigatorName: props.investigatorName}
        })
            .then((data: ObjectIdentifier[]) => {
                if (data.length > 0) {
                    setSubmissionDetail(
                        {
                            cycleName: props.cycle.name!,
                            //assume a distinct proposal is submitted once only to a particular cycle
                            submissionDate: data.at(0)!.code!,
                            submittedProposalId: data.at(0)!.dbid!
                        }
                    )
                }
            })
    }, [])

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
        const vars:UserProposalsSubmittedWithdrawProposalVariables = {
                headers: {authorization: token ? `Bearer ${token}` : undefined},
                pathParams: {submittedProposalId: submissionDetail?.submittedProposalId!},
                queryParams: {cycleId: props.cycle.dbid!}
        };
        fetchUserProposalsSubmittedWithdrawProposal(vars)
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess(
                "Withdrawn",
                "'" + props.proposalTitle + "' has been withdrawn from '" + props.cycle.name + "'."
            ))
            .catch(error => notifyError("Withdraw Fail", getErrorMessage(error)));
    }

    return(
        submissionDetail ?
            <Table.Tr>
                <Table.Td>{submissionDetail.cycleName}</Table.Td>
                <Table.Td>{submissionDetail.submissionDate}</Table.Td>
                <Table.Td>
                    <Tooltip
                        label={"withdraw this proposal from " + submissionDetail.cycleName}
                    >
                        <Button
                            variant={"outline"}
                            size={"xs"}
                            onClick={() => confirmWithdrawal()}
                        >
                            Withdraw
                        </Button>
                    </Tooltip>
                </Table.Td>
            </Table.Tr>
            :
            <></>
    )

}