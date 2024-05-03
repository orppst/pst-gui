import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {useAvailableResourcesResourceGetCycleResources} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanelFeatures/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

/*
    We will likely want to show the total amount of "available resource" against how much has been allocated
    to date
 */

export default function AvailableResourcesTable(selectedCycleCode: number) : ReactElement {

   const availableResources = useAvailableResourcesResourceGetCycleResources(
       {pathParams: {cycleCode: selectedCycleCode}}
   )

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
               {availableResources.data?.map((ar) =>(
                   <Table.Tr key={String(ar._id)}>
                       <Table.Td>{ar.type?.name}</Table.Td>
                       <Table.Td>{ar.type?.unit}</Table.Td>
                       <Table.Td>{ar.amount}</Table.Td>
                       <Table.Td c={"blue"}>{"not yet implemented"}</Table.Td>
                       <Table.Td c={"blue"}>{"not yet implemented"}</Table.Td>
                   </Table.Tr>
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