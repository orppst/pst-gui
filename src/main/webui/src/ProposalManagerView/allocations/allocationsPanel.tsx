import {ReactElement, useEffect, useState} from "react";
import {Alert, Container, Loader, Space, Tabs} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationsTable from "./allocations.table.tsx";
import AllocatedTable from "./allocated.table.tsx";
import {
    fetchAllocatedProposalResourceGetAllocatedProposals,
    fetchSubmittedProposalResourceGetSubmittedProposals, useProposalCyclesResourceGetProposalCycleDates
} from "../../generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {IconFolderCheck, IconFolderOpen} from "@tabler/icons-react";

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

    const [submittedIds, setSubmittedIds] =
        useState<number[]>([])
    const [allocatedIds, setAllocatedIds] =
        useState<number[]>([])

    // Need a list of submitted proposals that have yet to be allocated/decision made about allocation
    // dev note: a direct API call would be neater here
    useEffect(() => {
        fetchSubmittedProposalResourceGetSubmittedProposals({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })
            .then((submitted : ObjectIdentifier[]) => {
                fetchAllocatedProposalResourceGetAllocatedProposals({
                    pathParams: {cycleCode: Number(selectedCycleCode)}
                })
                    .then((allocated: ObjectIdentifier[]) => {
                        //array of ids that are in 'submitted' but are NOT in 'allocated'
                        let diff = submitted.filter(sub => {
                            let result : boolean = true
                            //dev note: assumes proposal titles ("names") are unique
                            if (allocated.find(alloc => alloc.name == sub.name))
                                result = false
                            return result;
                        })
                        setSubmittedIds(
                            diff.map(sub => (
                                sub.dbid!
                            ))
                        )
                        setAllocatedIds(
                            allocated.map(alloc => (
                                alloc.dbid!
                            ))
                        )
                    })
                    .catch(error => notifyError("Failed to load Allocated Proposals",
                        getErrorMessage(error)))
            })
            .catch(error => notifyError("Failed to load Submitted Proposals",
                getErrorMessage(error)) )
    }, []);

    const cycleDates = useProposalCyclesResourceGetProposalCycleDates({
        pathParams: {cycleCode: Number(selectedCycleCode)}
    })

    if (cycleDates.isLoading) {
        return(
            <Loader />
        )
    }

    if (cycleDates.error) {
        notifyError("Failed to load Proposal Cycle important dates",
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
                        <AllocationsTable submittedIds={submittedIds} />
                    </Tabs.Panel>

                    <Tabs.Panel value={"allocated"}>
                        <AllocatedTable allocatedIds={allocatedIds} />
                    </Tabs.Panel>
                </Tabs>
            }
        </PanelFrame>
    )
}