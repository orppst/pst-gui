import {ReactElement} from "react";
import {
    useAvailableResourcesResourceGetCycleResourceTypes,
    useProposalCyclesResourceGetCycleAllocationGrades
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {Group, Loader, Text} from "@mantine/core";
import AllocatedBlocksContent from "./allocatedBlocks.content.tsx";
import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export default
function AllocationBlocksResourceTypes(p: {
    allocatedBlocks: AllocatedBlock[], // all allocated blocks in the proposal
    allocatedProposalId: number,
    observingModeId: number
})
    : ReactElement {
    const {selectedCycleCode} = useParams();

    const cycleResourceTypes =
        useAvailableResourcesResourceGetCycleResourceTypes({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    const cycleGrades =
        useProposalCyclesResourceGetCycleAllocationGrades({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    if (cycleResourceTypes.isLoading || cycleGrades.isLoading) {
        return (
            <Loader />
        )
    }

    if (cycleResourceTypes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle resource types"}
                error={getErrorMessage(cycleResourceTypes.error)}
            />
        )
    }

    if (cycleGrades.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle grades"}
                error={getErrorMessage(cycleGrades.error)}
            />
        )
    }

    return (
        <>
            {
                //for each cycle defined resource type display elements to
                //add and update amounts for those types
                cycleResourceTypes.data?.map(rt => {
                    //need to filter allocatedBlocks by the resource type here
                    return (
                        <Group key={rt.dbid} justify={"center"}>
                            <Text mt={20} size={"sm"}>{capitaliseAllWords(rt.name!)}:</Text>
                            <AllocatedBlocksContent
                                allocatedBlocks={p.allocatedBlocks
                                    .filter(ab => {
                                        return ab.resource?.type === rt.dbid
                                            || ab.resource?.type?._id === rt.dbid
                                    })}
                                allocatedProposalId={p.allocatedProposalId}
                                observingModeId={p.observingModeId}
                                allGrades={cycleGrades.data!}
                                resourceType={rt}
                            />
                        </Group>
                    )
                })
            }
        </>
    )
}

function capitaliseAllWords(input: string) : string {
    return input.toLowerCase().split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.substring(1)).join(' ');
}