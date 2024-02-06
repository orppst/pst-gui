import {IconAlertCircle, IconCircleCheck, IconCircleX, IconInfoCircle} from '@tabler/icons-react';
import {Box, Table, Text} from "@mantine/core";
import {ICON_SIZE, JSON_SPACES} from "../constants.tsx";
import {useProposalResourceValidateObservingProposal} from "../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";

export default function ValidationOverview(props: {cycle: number}) {
    const { selectedProposalCode } = useParams();
    const {data, error, isLoading}
        = useProposalResourceValidateObservingProposal(
        {pathParams: {proposalCode: Number(selectedProposalCode)},
            queryParams: {cycleId: props.cycle}}
        );

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    return (
        <Box m={20}>Server side validation overview
            {isLoading?(<Text>Loading...</Text>):(
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>
                                {data?.isValid?
                                    (<IconCircleCheck size={ICON_SIZE} />):
                                    (<IconInfoCircle size={ICON_SIZE} />)
                                }
                            </Table.Td>
                            <Table.Td>
                                {data?.info}
                            </Table.Td>
                        </Table.Tr>
                        {data?.warnings !== "" &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconAlertCircle size={ICON_SIZE} />
                                </Table.Td>
                                <Table.Td>
                                    {data?.warnings}
                                </Table.Td>
                            </Table.Tr>)}
                        {data?.errors !== "" &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconCircleX size={ICON_SIZE} />
                                </Table.Td>
                                <Table.Td>
                                    {data?.errors}
                                </Table.Td>
                            </Table.Tr>)}
                    </Table.Tbody>
                </Table>
                )}
        </Box>
    );
}