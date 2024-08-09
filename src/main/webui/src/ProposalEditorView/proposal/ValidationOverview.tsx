import {IconAlertCircle, IconCircleCheck, IconCircleX, IconInfoCircle} from '@tabler/icons-react';
import {Box, Table, Text} from "@mantine/core";
import {ICON_SIZE, JSON_SPACES} from "src/constants.tsx";
import {useProposalResourceValidateObservingProposal} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import {useEffect} from "react";

export default function ValidationOverview(props: {cycle: number, setValid: any}) {
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

    useEffect(() => {
        if(data?.isValid) { props.setValid(true); }
        else {props.setValid(false)}
    }, [data]);

    return (
        <PanelFrame m={20}>Validation overview
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
                        {data?.warnings !== undefined &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconAlertCircle size={ICON_SIZE} />
                                </Table.Td>
                                <Table.Td>
                                    {data?.warnings}
                                </Table.Td>
                            </Table.Tr>)}
                        {data?.errors !== undefined &&
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
        </PanelFrame>
    );
}