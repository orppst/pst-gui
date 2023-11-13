import {Table} from "@mantine/core";
import {TargetTableHeader, TargetTableRow} from "./List.tsx";
import { ReactElement } from 'react';

type TargetProps = { proposalCode: number, dbid: number, showRemove: boolean };

/**
 *
 * @param {TargetProps} props the data associated with all the targets of a
 * proposal.
 * @return {ReactElement} the dynamic html for the target table.
 * @constructor
 */
export function RenderTarget(props: TargetProps): ReactElement {
        return (
            <Table>
                {TargetTableHeader()}
                <Table.Tbody>
                    {TargetTableRow(props)}
                </Table.Tbody>
            </Table>
    );
}