import {ReactElement} from "react";
import {Accordion, Fieldset, Group, Loader} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal, useObservingModeResourceGetObservingModeObjects
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AllocatedBlocksTable from "./allocatedBlocks.table.tsx";
import AllocatedBlockModal from "./allocatedBlock.modal.tsx";

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
                    allocatedProposal.data?.submitted?.config?.map(c => {
                        //the condition below looks wrong, but it is a product of the api
                        //returning the "thing" on first call then a reference (the DB id)
                        //on subsequent calls
                        let theMode =
                            observingModes.data?.find(o =>
                                o._id === c.mode?._id || o._id === c.mode
                            )


                        return (
                            <Fieldset legend={theMode!.name} key={String(c.mode)}>
                                {
                                    allocatedProposal.data?.allocation ?
                                        <AllocatedBlocksTable
                                            allocatedBlocks={allocatedProposal.data.allocation}
                                            proposalTitle={allocatedProposal.data?.submitted?.title!}
                                            allocatedProposalId={allocatedProposal.data._id!}
                                            observingModeId={theMode!._id!}
                                        /> :
                                        //this is the add button when there is nothing yet allocated
                                        <Group justify={"centre"} grow>
                                            <AllocatedBlockModal
                                                proposalTitle={allocatedProposal.data?.submitted?.title!}
                                                allocatedProposalId={allocatedProposal.data?._id!}
                                                observingModeId={theMode!._id!}
                                            />
                                        </Group>
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
        <Accordion defaultValue={"1"}>
            {allocatedBlocks}
        </Accordion>
    )
}