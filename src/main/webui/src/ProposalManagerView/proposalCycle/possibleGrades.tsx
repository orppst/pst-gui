import {ReactElement} from "react";
import {Table} from "@mantine/core";
import {useParams} from "react-router-dom";
import {
    useProposalCyclesResourceGetCycleAllocatedGrade,
    useProposalCyclesResourceGetCycleAllocationGrades
} from "../../generated/proposalToolComponents.ts";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export default function AllocationGradesTable() : ReactElement {

    const {selectedCycleCode} = useParams();

    const allocationGrades = useProposalCyclesResourceGetCycleAllocationGrades(
        {pathParams: {cycleCode: Number(selectedCycleCode)}}
    )

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
            {pathParams:{cycleCode: Number(selectedCycleCode), gradeId: id}}
        )

        if (allocationGrade.error) {
            notifications.show({
                message: "cause: " + getErrorMessage(allocationGrade.error),
                title: "Failed to load allocation grade",
                autoClose: 5000,
                color: 'red'
            })
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



