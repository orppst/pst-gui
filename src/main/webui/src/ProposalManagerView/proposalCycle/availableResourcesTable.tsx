import {ReactElement} from "react";
import {Loader, Table} from "@mantine/core";
import {
    useAvailableResourcesResourceGetCycleAvailableResources, useAvailableResourcesResourceGetCycleResourceUsed
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {Resource} from "../../generated/proposalToolSchemas.ts";


function AvailableResourcesRow(p: {available: Resource, cycleCode: number}) : ReactElement {
    const allocated = useAvailableResourcesResourceGetCycleResourceUsed(
        {pathParams: {cycleCode: p.cycleCode , resourceName: p.available.type?.name!}}
    )

    if (allocated.isLoading) {
        return (
            <Table.Tr>
                <Loader/>
            </Table.Tr>
        )
    }
    return (
        <Table.Tr>
            <Table.Td>{p.available.type?.name}</Table.Td>
            <Table.Td>{p.available.type?.unit}</Table.Td>
            <Table.Td>{p.available.amount}</Table.Td>
            {
                allocated.isError ?
                    <Table.Td c={"red"}>{"Error fetching allocated value"}</Table.Td>
                    :
                    <>
                        <Table.Td>{allocated.data}</Table.Td>
                        <Table.Td>{p.available.amount! - allocated.data!}</Table.Td>
                    </>
            }
        </Table.Tr>
    )
}

export default function AvailableResourcesTable(selectedCycleCode: number) : ReactElement {

    const availableResources = useAvailableResourcesResourceGetCycleAvailableResources(
       {pathParams: {cycleCode: selectedCycleCode}}
    )

    if (availableResources.isLoading) {
        return (<Loader/>)
    }

    if (availableResources.error) {
       notifyError("Failed to load available resources list",
           "cause: " + getErrorMessage(availableResources.error))
    }

    const AvailableResourcesTableHeader = () : ReactElement => {
       return (
           <Table.Thead>
               <Table.Tr>
                   <Table.Th>Name</Table.Th>
                   <Table.Th>Unit</Table.Th>
                   <Table.Th>Total</Table.Th>
                   <Table.Th>Allocated</Table.Th>
                   <Table.Th>Remaining</Table.Th>
               </Table.Tr>
           </Table.Thead>
       )
    }

    const AvailableResourcesTableBody = () : ReactElement => {
       return (
           <Table.Tbody>
               {availableResources.data?.resources?.map((ar) =>(
                   <AvailableResourcesRow
                       key={String(ar._id)}
                       available={ar}
                       cycleCode={selectedCycleCode}
                   />
               ))}
           </Table.Tbody>
       )
    }

    return (
        <Table>
            <AvailableResourcesTableHeader />
            <AvailableResourcesTableBody />
        </Table>
    )
}