import {Table} from "@mantine/core";
import {TargetTableHeader, TargetTableRow} from "./List.tsx";

type TargetProps = { proposalCode: number, dbid: number, showRemove: boolean };

export function RenderTarget(props: TargetProps) {
        return (
            <Table>
                {TargetTableHeader()}
                <Table.Tbody>
                    {TargetTableRow(props)}
                </Table.Tbody>
            </Table>
    );


}