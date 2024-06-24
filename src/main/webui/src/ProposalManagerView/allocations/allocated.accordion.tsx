import {ReactElement} from "react";
import {Accordion, Loader} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AllocatedBlocksTable from "./allocatedBlocks.table.tsx";

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

    if (allocatedProposal.isLoading) {
        return (<Loader/>)
    }

    if (allocatedProposal.error) {
        notifyError("Failed to load Allocated Proposal",
            getErrorMessage(allocatedProposal.error))
    }


    return (
        <Accordion.Item value={String(allocatedProposal.data?._id)}>
            <Accordion.Control>
                {allocatedProposal.data?.submitted?.proposal?.title}
            </Accordion.Control>
            <Accordion.Panel>
                {allocatedProposal.data?.allocation &&
                    <AllocatedBlocksTable
                        allocatedBlocks={allocatedProposal.data.allocation}
                        proposalTitle={allocatedProposal.data?.submitted?.proposal?.title!}
                        allocatedProposalId={allocatedProposal.data._id!}
                    />
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