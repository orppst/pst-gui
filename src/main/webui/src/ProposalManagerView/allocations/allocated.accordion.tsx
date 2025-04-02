import {ReactElement} from "react";
import {Accordion, Fieldset, Loader, Text} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal,
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import AllocatedBlocksObservingMode from "./allocatedBlocks.observingMode.tsx";


function AllocatedAccordionItem(p: {
    cycleCode: number,
    allocatedProposalId: number,
    cycleResourceTypes: ObjectIdentifier[],
    timeUnit: string,
    totalTimeAvailable: number
}) : ReactElement {

    const allocatedProposal =
        useAllocatedProposalResourceGetAllocatedProposal({
            pathParams: {
                cycleCode: p.cycleCode,
                allocatedId: p.allocatedProposalId
            }
        })

    if (allocatedProposal.isLoading) {
        return (<Loader/>)
    }

    if (allocatedProposal.error) {
        return (
            <AlertErrorMessage
                title={"Failed to load Allocated Proposal"}
                error={getErrorMessage(allocatedProposal.error)}
            />
        )
    }

    let totalTimeAllocated : number = 0

    let observingTimeTypeId =
        allocatedProposal.data?.allocation?.find(ab =>
            ab.resource?.type?.name === 'observing time')?.resource?.type?._id

    allocatedProposal.data?.allocation?.forEach((allocatedBlock) => {
        if (allocatedBlock.resource?.type?._id === observingTimeTypeId ||
            allocatedBlock.resource?.type === observingTimeTypeId) {
            totalTimeAllocated += allocatedBlock.resource?.amount!
        }
    })

    let timeAllocatedPercent : string = ((totalTimeAllocated / p.totalTimeAvailable) * 100).toFixed(1)

    return (
        <Accordion.Item value={String(allocatedProposal.data?._id)}>
            <Accordion.Control>
                <Text>
                    {allocatedProposal.data?.submitted?.title} ---- <Text size={"xs"} span c={'blue'}>
                    {totalTimeAllocated} {p.timeUnit} ({timeAllocatedPercent}%)</Text>
                </Text>
            </Accordion.Control>
            <Accordion.Panel>
                {
                    p.cycleResourceTypes.map(rt => {
                        return (
                            <Fieldset
                                legend={capitaliseAllWords(rt.name!) + " (" + p.timeUnit + ")" }
                                key={String(allocatedProposal.data?._id) + String(rt.dbid)}
                            >
                                <AllocatedBlocksObservingMode
                                    allocatedProposal={allocatedProposal.data!}
                                    cycleId={p.cycleCode}
                                    resourceTypeName={rt.name!}
                                    proposalTitle={allocatedProposal.data?.submitted?.title!}
                                />
                            </Fieldset>
                        )
                    })
                }
            </Accordion.Panel>
        </Accordion.Item>
    )
}


export default
function AllocatedAccordion(p: {
    allocatedIds: ObjectIdentifier[],
    cycleResourceTypes: ObjectIdentifier[],
    totalTimeAvailable: number
}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const allocatedBlocks = p.allocatedIds.map(ap =>(
        <AllocatedAccordionItem
            key={ap.dbid}
            cycleCode={Number(selectedCycleCode)}
            allocatedProposalId={ap.dbid!}
            cycleResourceTypes={p.cycleResourceTypes}
            timeUnit={p.cycleResourceTypes.find(rt =>
                rt.name === 'observing time')?.code ?? ""}
            totalTimeAvailable={p.totalTimeAvailable}
        />
    ))

    return(
        <Accordion defaultValue={"1"} variant={"separated"}>
            {allocatedBlocks}
        </Accordion>
    )
}

function capitaliseAllWords(input: string) : string {
    return input.toLowerCase().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
}