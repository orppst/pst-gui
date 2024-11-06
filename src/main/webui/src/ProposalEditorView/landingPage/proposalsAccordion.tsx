import {ReactElement} from "react";
import {Accordion, Fieldset, Grid, Group, Loader, ScrollArea, Text} from "@mantine/core";
import {useProposalResourceGetProposals} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ProposalSynopsis} from "../../generated/proposalToolSchemas.ts";

export default
function ProposalsAccordion() : ReactElement {

    const proposals = useProposalResourceGetProposals({})

    if (proposals.isError) {
        notifyError("Error fetching proposals", getErrorMessage(proposals.error))
        return <></>
    }

    if (proposals.isLoading) {
        return <Loader />
    }


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
        proposals.data?.length === 0 ?
            <Text>Please create a proposal</Text>
            :
            <Accordion variant={"contained"}>
                {proposals.data?.map(proposal => (proposalDetails(proposal)))}
            </Accordion>
    )
}