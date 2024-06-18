import {ReactElement, useEffect, useState} from "react";
import {Fieldset} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationsTable from "./allocations.table.tsx";
import AllocatedTable from "./allocated.table.tsx";
import {
    fetchAllocatedProposalResourceGetAllocatedProposals,
    fetchSubmittedProposalResourceGetSubmittedProposals
} from "../../generated/proposalToolComponents.ts";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

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

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Allocations"}
            />
            <Fieldset legend={"Submitted Proposals"}>
                <AllocationsTable submittedIds={submittedIds} />
            </Fieldset>
            <Fieldset legend={"Allocated Proposals"}>
                <AllocatedTable allocatedIds={allocatedIds} />
            </Fieldset>
        </PanelFrame>
    )
}