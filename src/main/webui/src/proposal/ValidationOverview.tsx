import { IconCheck } from '@tabler/icons-react';
import {Box, Table} from "@mantine/core";
import {ICON_SIZE} from "../constants.tsx";

export default function ValidationOverview() {
    return (
        <Box m={20}>This is where we can have a validation overview, the following are <b>not</b> real!
            <Table>
                <Table.Tbody>
                    <Table.Tr><Table.Td><IconCheck size={ICON_SIZE}/></Table.Td><Table.Td>Summary</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td><IconCheck size={ICON_SIZE}/></Table.Td><Table.Td>Investigators</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td><IconCheck size={ICON_SIZE}/></Table.Td><Table.Td>Targets</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td><IconCheck size={ICON_SIZE}/></Table.Td><Table.Td>Technical Goals</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td><IconCheck size={ICON_SIZE}/></Table.Td><Table.Td>Observations</Table.Td></Table.Tr>
                    <Table.Tr><Table.Td><IconCheck size={ICON_SIZE}/></Table.Td><Table.Td>Documents</Table.Td></Table.Tr>
                </Table.Tbody>
            </Table>
        </Box>
    );
}