import {ReactElement} from "react";
import { Loader, Table} from "@mantine/core";
import {
    useObservingModeResourceGetObservingModeObjects,
    useProposalCyclesResourceGetCycleAllocationGrades
} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {AllocatedProposal} from "../../generated/proposalToolSchemas.ts";
import AllocatedBlocksContent from "./allocatedBlocks.content.tsx";

export default
function AllocatedBlocksObservingMode(p:{
    allocatedProposal: AllocatedProposal,
    cycleId: number,
    resourceTypeName: string,
    proposalTitle: string
}) : ReactElement {

    const observingModes =
        useObservingModeResourceGetObservingModeObjects({
            pathParams: {cycleId: p.cycleId }
        })

    const cycleGrades =
        useProposalCyclesResourceGetCycleAllocationGrades({
            pathParams: {cycleCode: p.cycleId}
        })

    if (observingModes.isLoading || cycleGrades.isLoading) {
        return (<Loader/>)
    }

    if (observingModes.error) {
        return (
            <AlertErrorMessage
                title={"Failed to load Observing Modes"}
                error={getErrorMessage(observingModes.error)}
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
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Mode</Table.Th>
                    <Table.Th>No. Obs.</Table.Th>
                    {
                        cycleGrades.data?.map(g => (
                            <Table.Th key={g.dbid}>Grade {g.name}</Table.Th>
                        ))
                    }
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {
                p.allocatedProposal.submitted?.config?.sort(
                    (a,b) => {
                        return a.observation?.length! - b.observation?.length!
                    }
                ).map((oc => {
                    let theMode =
                        observingModes.data?.find(om =>
                            om._id === oc.mode?._id || om._id === oc.mode
                        )
                    return (
                        <Table.Tr key={theMode!._id}>
                            <Table.Td>{theMode!.name}</Table.Td>
                            <Table.Td>{oc.observation?.length}</Table.Td>
                            <AllocatedBlocksContent
                                allocatedBlocks={p.allocatedProposal.allocation?.filter(ab =>
                                        ab.mode?._id === theMode!._id || ab.mode === theMode!._id) ?? []}
                                allocatedProposalId={p.allocatedProposal._id!}
                                observingModeId={theMode!._id!}
                                numberObservations={oc.observation?.length ?? 0}
                                allGrades={cycleGrades.data!}
                                resourceTypeName={p.resourceTypeName}
                                modeName={theMode!.name!}
                                proposalTitle={p.proposalTitle}
                            />
                        </Table.Tr>
                    )
                }))
            }
            </Table.Tbody>
        </Table>
    )
}