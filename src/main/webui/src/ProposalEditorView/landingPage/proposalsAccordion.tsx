import {ReactElement} from "react";
import {Accordion, Fieldset, Grid, Group, ScrollArea, Text} from "@mantine/core";
import {ObjectIdentifier, ProposalSynopsis} from "../../generated/proposalToolSchemas.ts";

export default
function ProposalsAccordion(
    props: {proposals: ProposalSynopsis[], cycles: ObjectIdentifier[]})
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
                    <Group grow>
                        <Text c={"yellow.6"}>
                            {'\"' + proposal.title + '\"'}
                        </Text>
                        <Text>
                            {proposal.kind}
                        </Text>
                        <Text>
                            Submitted to 0 cycles
                        </Text>
                    </Group>
                </Accordion.Control>
                <Accordion.Panel>
                    <Grid columns={8}>
                        <Grid.Col span={4}>
                            {proposalSummary(proposal.summary!)}
                        </Grid.Col>
                        <Grid.Col span={3}>
                            Submitted details here
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