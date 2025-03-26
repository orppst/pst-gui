import {ReactElement} from "react";
import {Accordion, Fieldset, Loader} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal, useObservingModeResourceGetObservingModeObjects
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AllocationBlocksResourceTypes from "./allocationBlocks.resourceTypes.tsx";

type AllocatedItemProps = {
    cycleCode: number,
    allocatedProposalId: number
}

function AllocatedAccordionItem(props: AllocatedItemProps) : ReactElement {

    const allocatedProposal =
        useAllocatedProposalResourceGetAllocatedProposal({
            pathParams: {
                cycleCode: props.cycleCode,
                allocatedId: props.allocatedProposalId
            }
        })

    const observingModes =
        useObservingModeResourceGetObservingModeObjects({
            pathParams: {cycleId: props.cycleCode }
        })

    if (allocatedProposal.isLoading || observingModes.isLoading) {
        return (<Loader/>)
    }

    if (allocatedProposal.error) {
        notifyError("Failed to load Allocated Proposal",
            getErrorMessage(allocatedProposal.error))
    }

    if (observingModes.error) {
        notifyError("Failed to load Allocated Proposal",
            getErrorMessage(observingModes.error))
    }

    return (
        <Accordion.Item value={String(allocatedProposal.data?._id)}>
            <Accordion.Control>
                {allocatedProposal.data?.submitted?.title}
            </Accordion.Control>
            <Accordion.Panel>
                {
                    allocatedProposal.data?.submitted?.config?.map(oc => {
                        //Roll up, roll up and play a game of "Object or Reference?"!
                        let theMode =
                            observingModes.data?.find(om =>
                                om._id === oc.mode?._id || om._id === oc.mode
                            )
                        return (
                            <Fieldset
                                legend={theMode!.name}
                                key={String(allocatedProposal.data?._id) + String(theMode!._id)}
                            >
                                {
                                    <AllocationBlocksResourceTypes
                                        allocatedBlocks={allocatedProposal.data?.allocation ?? []}
                                        allocatedProposalId={allocatedProposal.data?._id!}
                                        observingModeId={theMode!._id!}
                                    />
                                }
                            </Fieldset>
                        )
                    })
                }
            </Accordion.Panel>
        </Accordion.Item>
    )
}


export default
function AllocatedAccordion(props: {allocatedIds: ObjectIdentifier[]}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const allocatedBlocks = props.allocatedIds.map(ap =>(
        <AllocatedAccordionItem
            key={ap.dbid}
            cycleCode={Number(selectedCycleCode)}
            allocatedProposalId={ap.dbid!}
        />
    ))

    return(
        <Accordion defaultValue={"1"} variant={"separated"}>
            {allocatedBlocks}
        </Accordion>
    )
}