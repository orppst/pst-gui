import {ReactElement} from "react";
import {
    useAvailableResourcesResourceGetCycleResourceRemaining,
    useAvailableResourcesResourceGetCycleResourceUsed
} from "../../generated/proposalToolComponents.ts";
import {Loader, MantineColor, Table} from "@mantine/core";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

function ResourceStatsRow(p: {
    cycleCode: number,
    resourceName: string,
    resourceUnit: string
    totalAvailable: number
}) : ReactElement {

    const resourceUsed =
        useAvailableResourcesResourceGetCycleResourceUsed({
            pathParams: {
                cycleCode: p.cycleCode,
                resourceName: p.resourceName
            }
        })

    const resourceRemaining =
        useAvailableResourcesResourceGetCycleResourceRemaining({
            pathParams: {
                cycleCode: p.cycleCode,
                resourceName: p.resourceName
            }
        })

    if (resourceUsed.isLoading ||
        resourceRemaining.isLoading) {
        return <Loader/>
    }

    if (resourceUsed.error) {
        notifyError("Failed to load resource used",
            getErrorMessage(resourceUsed.error))
    }

    if (resourceRemaining.error) {
        notifyError("Failed to load resource remaining",
            getErrorMessage(resourceRemaining.error))
    }

    let textColour : MantineColor = resourceRemaining.data === 0 ? 'red.6'
        : resourceRemaining.data! < 100 ? 'yellow.6' : 'green.6';

    return (
        <Table.Tr c={textColour}>
            <Table.Td>{p.resourceName} ({p.resourceUnit})</Table.Td>
            <Table.Td>{p.totalAvailable}</Table.Td>
            <Table.Td>{resourceUsed.data}</Table.Td>
            <Table.Td>{resourceRemaining.data}</Table.Td>
        </Table.Tr>
    )
}

export default
function ResourceStatsTable(p: {
    cycleCode: number,
    totalAvailable: number,
    cycleResourceTypes: ObjectIdentifier[]
}) : ReactElement {

    const resourceStatsRows =
        p.cycleResourceTypes.map(type =>(
        <ResourceStatsRow
            key={type.dbid}
            cycleCode={p.cycleCode}
            resourceName={type.name!}
            resourceUnit={type.code!}
            totalAvailable={p.totalAvailable}
        />
    ))

    return(
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Resource</Table.Th>
                    <Table.Th>Total</Table.Th>
                    <Table.Th>Used</Table.Th>
                    <Table.Th>Remaining</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {resourceStatsRows}
            </Table.Tbody>
        </Table>
    )
}