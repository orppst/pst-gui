import {ReactElement} from "react";
import {Alert, Container, Fieldset, Grid, Loader, ScrollArea, Space, Tabs} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationsTable from "./allocations.table.tsx";
import AllocatedAccordion from "./allocated.accordion.tsx";
import {
    useAllocatedProposalResourceGetAllocatedProposals,
    useProposalCyclesResourceGetProposalCycleDates,
    useSubmittedProposalResourceGetSubmittedNotYetAllocated
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {IconFolderCheck, IconFolderOpen} from "@tabler/icons-react";
import ResourceStatsTable from "./resourceStats.table.tsx";

/*
    List all submitted proposals that have been reviewed (all reviews complete) and update
    the "success" status of each based on the reviews.

    The function that assigns a true state to "success" should also "promote" the submitted
    proposal to an allocated proposal with an initial allocation of zero resources, which
    can be adjusted later.

    List allocated proposals with the amount of resource(s) assigned to them so far, with
    a form/function to adjust the amount of resource to a desired value.

    User will likely want displayed the total amount of resources available, allocated,
    and remaining.
 */

export default function AllocationsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    const notYetAllocated =
        useSubmittedProposalResourceGetSubmittedNotYetAllocated({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    const allocated =
        useAllocatedProposalResourceGetAllocatedProposals({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    const cycleDates =
        useProposalCyclesResourceGetProposalCycleDates({
        pathParams: {cycleCode: Number(selectedCycleCode)}
    })

    if (allocated.isLoading) {
        return(
            <Loader />
        )
    }

    if (allocated.error) {
        notifyError("Failed to load allocated proposals",
            getErrorMessage(allocated.error))
    }

    if (notYetAllocated.isLoading) {
        return(
            <Loader />
        )
    }

    if (notYetAllocated.error) {
        notifyError("Failed to load not yet allocated submitted proposals",
            getErrorMessage(notYetAllocated.error))
    }

    if (cycleDates.isLoading) {
        return(
            <Loader />
        )
    }

    if (cycleDates.error) {
        notifyError("Failed to load Proposal Cycle dates",
            getErrorMessage(cycleDates.error))
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Allocations"}
            />
            {new Date(cycleDates.data?.submissionDeadline!).getTime() > new Date().getTime() ?
                <Container size={"50%"} mt={100}>
                    <Alert variant={"light"} title={"Submission Deadline not surpassed"}>
                        Cannot allocate proposals before the submission deadline:
                        <Space h={"xs"}/>
                        {new Date(cycleDates.data?.submissionDeadline!).toUTCString()}
                    </Alert>
                </Container>
                :
                <Tabs defaultValue={"submitted"}>
                    <Tabs.List>
                        <Tabs.Tab value={"submitted"} leftSection={<IconFolderOpen/>}>
                            Submitted Proposals
                        </Tabs.Tab>
                        <Tabs.Tab value={"allocated"} leftSection={<IconFolderCheck/>}>
                            Allocated Proposals
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value={"submitted"}>
                        <AllocationsTable submittedIds={notYetAllocated.data!} />
                    </Tabs.Panel>

                    <Tabs.Panel value={"allocated"}>
                        <Grid columns={10}>
                            <Grid.Col
                                span={{base: 10, xl: 6}}
                                order={{base: 2, xl: 1}}
                            >
                                <ScrollArea>
                                    <AllocatedAccordion allocatedIds={allocated.data!} />
                                </ScrollArea>
                            </Grid.Col>
                            <Grid.Col
                                span={{base: 10, xl: 4}}
                                order={{base: 1, xl: 2}}
                            >
                                <Fieldset legend={"Resource Amounts"}>
                                    <ResourceStatsTable
                                        cycleCode={Number(selectedCycleCode)}
                                    />
                                </Fieldset>
                            </Grid.Col>
                        </Grid>
                    </Tabs.Panel>
                </Tabs>
            }
        </PanelFrame>
    )
}