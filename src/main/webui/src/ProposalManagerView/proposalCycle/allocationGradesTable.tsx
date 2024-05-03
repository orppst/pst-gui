import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {
    useProposalCyclesResourceGetCycleAllocatedGrade,
    useProposalCyclesResourceGetCycleAllocationGrades
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {notifyError} from "../../commonPanelFeatures/notifications.tsx";

export default function AllocationGradesTable(selectedCycleCode: number) : ReactElement {

    const allocationGrades = useProposalCyclesResourceGetCycleAllocationGrades(
        {pathParams: {cycleCode: selectedCycleCode}}
    )

    if (allocationGrades.error) {
        notifyError("Failed to load allocation grades list",
            "cause: " + getErrorMessage(allocationGrades.error))
    }

    const AllocationGradesTableHeader = () : ReactElement => {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Grade</Table.Th>
                    <Table.Th>Description</Table.Th>
                </Table.Tr>
            </Table.Thead>
        )
    }

    const AllocationGradeTableRow = (id: number) : ReactElement  => {

        const allocationGrade = useProposalCyclesResourceGetCycleAllocatedGrade(
            {pathParams:{cycleCode: selectedCycleCode, gradeId: id}}
        )

        if (allocationGrade.error) {
            notifyError("Failed to load allocation grade",
                "cause: " + getErrorMessage(allocationGrade.error))
        }

        return (
            <Table.Tr key={String(id)}>
                <Table.Td>{allocationGrade.data?.name}</Table.Td>
                <Table.Td>{allocationGrade.data?.description}</Table.Td>
            </Table.Tr>
        )
    }


    const AllocationGradesTableBody= () : ReactElement => {
        return (
            <Table.Tbody>
                {allocationGrades.data?.map((grade) => {
                    return AllocationGradeTableRow(grade.dbid!)
                })}
            </Table.Tbody>
        )
    }

    return(
        <Table>
            <AllocationGradesTableHeader />
            <AllocationGradesTableBody />
        </Table>
    )
}



