import {ReactElement} from "react";
import {useProposalCyclesResourceGetCycleObservingTimeTotals} from "../../generated/proposalToolComponents.ts";
import {Loader, Table} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

type modeGradeRow = {
    modeName: string,
    gradeNames: string[],
    totals: number[]
}


function TheTable(p:{
    tableData: modeGradeRow[],
    maxColIndex: number
}) : ReactElement {

    let maxRowIndex = p.tableData.length - 1;

    return (
        <Table
            withColumnBorders
            //borderColor={"orange.4"}
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Mode</Table.Th>
                    {
                        p.tableData.at(0)!.gradeNames.map(g => (
                            <Table.Th key={g}>Grade {g}</Table.Th>
                        ))
                    }
                    <Table.Th c={"green.4"}>Mode Totals</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {
                    p.tableData.map((d,row) => (
                        <Table.Tr
                            key={d.modeName}
                            c={d.modeName === 'Grade Totals' ? "yellow.6": ""}
                        >
                            <Table.Td>{d.modeName}</Table.Td>
                            {
                                d.totals.map((t, col) => (
                                    <Table.Td
                                        key={col}
                                        c={col === p.maxColIndex ? row !== maxRowIndex ? "green.4" : "blue.4" : ""}
                                    >
                                        {t}
                                    </Table.Td>
                                ))
                            }
                        </Table.Tr>
                    ))
                }
            </Table.Tbody>
        </Table>
    )
}

export default
function ResourceModeGradeTotalsTable(p : {
    cycleId: number,
}) : ReactElement {

    const modeGradeTotals =
        useProposalCyclesResourceGetCycleObservingTimeTotals({
            pathParams: {cycleCode: p.cycleId}
        })

    if (modeGradeTotals.isLoading) {
        return (<Loader />)
    }

    if (modeGradeTotals.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load totals"}
                error={getErrorMessage(modeGradeTotals.error)}
            />
        )
    }

    let allGrades: string[] = []

    modeGradeTotals.data?.forEach(d => {
        if (!allGrades.includes(d.gradeName!)) {
            allGrades.push(d.gradeName!)
        }
    })

    let tableData : modeGradeRow[] = []
    let prevModeName = ""
    let rowTotal = -1

    let columnTotals : number[] = allGrades!.map(() => {
        return 0
    })

    let columnIndex = 0

    modeGradeTotals.data?.sort((a,b) => {
        if (a.modeName! > b.modeName!) return -1
        else if (a.modeName === b.modeName) {
            if (a.gradeName! > b.gradeName! ) return 1
            else return -1
        }
        else return 1
    }).forEach(o => {
        if (o.modeName !== prevModeName) {
            //row change
            columnIndex = 0
            //deal with initial entry
            if (rowTotal !== -1) {
                tableData.map(row => {
                    if (row.modeName === prevModeName) {
                        return {
                            ...row,
                            totals: row.totals.push(rowTotal)
                        }
                    } else {
                        return row
                    }
                })
            }
            tableData.push({modeName: o.modeName!, gradeNames: [o.gradeName!], totals: [o.totalTime!]})
            prevModeName = o.modeName!
            rowTotal = o.totalTime!
        } else {
            //same row, next column
            columnIndex++

            tableData.map(row => {
                if (row.modeName === o.modeName) {
                    return {
                        ...row,
                        gradeNames: row.gradeNames.push(o.gradeName!),
                        totals: row.totals.push(o.totalTime!)
                    }
                } else {
                    return row
                }
            })
            rowTotal += o.totalTime!
        }

        columnTotals = columnTotals.map((v,i) => {
            return  columnIndex === i ? v + o.totalTime! : v
        })
    })

    //do the final mode row total
    tableData.map(row => {
        if (row.modeName === prevModeName) {
            return {
                ...row,
                totals: row.totals.push(rowTotal)
            }
        } else {
            return row
        }
    })

    //append final tableData row containing column totals & overall total
    let overallTotal = columnTotals.reduce((sum, v) => sum + v, 0);
    columnTotals.push(overallTotal)

    tableData.push({modeName: "Grade Totals", gradeNames: [], totals: columnTotals})



    return (
        <TheTable
            tableData={tableData}
            maxColIndex={columnTotals.length - 1}
        />
    )
}