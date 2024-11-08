import {ReactElement, useEffect, useState} from "react";
import {Accordion, Fieldset, Grid, Group, ScrollArea, Table, Text} from "@mantine/core";
import {ObjectIdentifier, ProposalSynopsis} from "../../generated/proposalToolSchemas.ts";
import {fetchSubmittedProposalResourceGetSubmittedProposals} from "../../generated/proposalToolComponents.ts";
import {randomId} from "@mantine/hooks";

type SubmissionDetail = {
    cycleName: string,
    submissionDate: string
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
                        <Grid.Col span={5}>
                            {proposalSummary(proposal.summary!)}
                        </Grid.Col>
                        <Grid.Col span={3}>
                            <Table withTableBorder>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Submitted to:</Table.Th>
                                        <Table.Th>Submission date</Table.Th>
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
                            submissionDate: data.at(0)!.code!,}
                    )
                }
            })
    }, [])

    return(
        submissionDetail ?
            <Table.Tr key={randomId()}>
                <Table.Td>{submissionDetail.cycleName}</Table.Td>
                <Table.Td>{submissionDetail.submissionDate}</Table.Td>
            </Table.Tr>
            :
            <></>
    )

}