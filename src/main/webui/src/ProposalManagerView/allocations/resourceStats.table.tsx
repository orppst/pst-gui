import {ReactElement} from "react";
import {
    useAvailableResourcesResourceGetCycleResourceRemaining,
    useAvailableResourcesResourceGetCycleResourceTotal, useAvailableResourcesResourceGetCycleResourceTypes,
    useAvailableResourcesResourceGetCycleResourceUsed
} from "../../generated/proposalToolComponents.ts";
import {Loader, Table} from "@mantine/core";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

function ResourceStatsRow(props: {cycleCode: number, resourceName: string}) : ReactElement {

    const totalAvailable =
        useAvailableResourcesResourceGetCycleResourceTotal({
            pathParams: {
                cycleCode: props.cycleCode,
                resourceName: props.resourceName
            }
        })

    const resourceUsed =
        useAvailableResourcesResourceGetCycleResourceUsed({
            pathParams: {
                cycleCode: props.cycleCode,
                resourceName: props.resourceName
            }
        })

    const resourceRemaining =
        useAvailableResourcesResourceGetCycleResourceRemaining({
            pathParams: {
                cycleCode: props.cycleCode,
                resourceName: props.resourceName
            }
        })

    if (totalAvailable.isLoading || resourceUsed.isLoading ||
        resourceRemaining.isLoading) {
        return <Loader/>
    }

    if (totalAvailable.error) {
        notifyError("Failed to load total available resource",
            getErrorMessage(totalAvailable.error))
    }

    if (resourceUsed.error) {
        notifyError("Failed to load resource used",
            getErrorMessage(resourceUsed.error))
    }

    if (resourceRemaining.error) {
        notifyError("Failed to load resource remaining",
            getErrorMessage(resourceRemaining.error))
    }

    return (
        <Table.Tr>
            <Table.Td>{props.resourceName}</Table.Td>
            <Table.Td>{totalAvailable.data}</Table.Td>
            <Table.Td>{resourceUsed.data}</Table.Td>
            <Table.Td>{resourceRemaining.data}</Table.Td>
        </Table.Tr>
    )
}

export default
function ResourceStatsTable(props: {cycleCode: number}) : ReactElement {

    const cycleResourceTypes =
        useAvailableResourcesResourceGetCycleResourceTypes({
            pathParams: {cycleCode: props.cycleCode}
        })

    if (cycleResourceTypes.isLoading) {
        return <Loader/>
    }

    if (cycleResourceTypes.error) {
        notifyError("Failed to load Resource Types",
            getErrorMessage(cycleResourceTypes.error))
    }

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
                {cycleResourceTypes.data?.map(type =>(
                    <ResourceStatsRow
                        key={type.dbid}
                        cycleCode={props.cycleCode}
                        resourceName={type.name!}
                    />
                ))}
            </Table.Tbody>
        </Table>
    )
}