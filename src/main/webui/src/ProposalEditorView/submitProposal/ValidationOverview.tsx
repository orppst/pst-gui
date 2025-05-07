import {IconAlertCircle, IconCircleCheck, IconCircleX, IconInfoCircle} from '@tabler/icons-react';
import {Box, Divider, Loader, Stack, Table, Text} from "@mantine/core";
import {ICON_SIZE} from "src/constants.tsx";
import {
    useProposalCyclesResourceGetProposalCycleDates, useProposalCyclesResourceGetProposalCycleObservatory,
    useProposalCyclesResourceGetProposalCycleTitle,
    useProposalResourceValidateObservingProposal
} from "src/generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ReactElement, useEffect} from "react";

// interface to support destructuring to avoid infinite loop.
interface ValidationOverviewProps {
    cycle: number;
    smallScreen?: boolean;
    onValidationError: (error: string | undefined) => void;
}

export default function ValidationOverview(
        {cycle, smallScreen, onValidationError,}: ValidationOverviewProps):
        ReactElement {

    const { selectedProposalCode } = useParams();

    const validateProposal = useProposalResourceValidateObservingProposal({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            queryParams: {cycleId: cycle}}
        );

    const cycleTitle = useProposalCyclesResourceGetProposalCycleTitle({
        pathParams: {cycleCode: cycle}
    })

    const cycleDates = useProposalCyclesResourceGetProposalCycleDates(
        {pathParams: {cycleCode: cycle}});

    const observatory = useProposalCyclesResourceGetProposalCycleObservatory({
            pathParams: {cycleCode: cycle}
        })

    //update the validation state when result comes in.
    useEffect(() => {
        if (validateProposal.data?.errors !== undefined) {
            onValidationError(validateProposal.data.errors);
        } else {
            onValidationError(undefined); // Clear error
        }
    }, [validateProposal.data?.errors, onValidationError, cycle]);

    if (validateProposal.isLoading || cycleTitle.isLoading ||
            cycleDates.isLoading || observatory.isLoading) {
        return(
            <Box mx={"50%"}>
                <Loader/>
            </Box>
        )
    }

    if (validateProposal.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load validation data"}
                error={getErrorMessage(validateProposal.error)}
            />
        );
    }

    if (cycleTitle.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle title"}
                error={getErrorMessage(cycleTitle.error)}
            />
        );
    }

    if (cycleDates.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle dates"}
                error={getErrorMessage(cycleDates.error)}
            />
        );
    }

    return (
        <PanelFrame
            maw={smallScreen ? "100%": "75%"}
            ml={smallScreen ? "" : "10%"}
        >
            <Stack>
                <Text>
                    {observatory.data?.name}: {cycleTitle.data} - Proposal Check
                </Text>
                <Divider/>
                Validation overview for {validateProposal.data?.title} submitting to {cycleTitle.data}
                <Text
                    size={"sm"}
                    c={"teal"}
                    fw={"bold"}
                >
                    Submission Deadline: {cycleDates.data?.submissionDeadline}
                </Text>
                <Table>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>
                                {validateProposal.data?.isValid?
                                    (<IconCircleCheck size={ICON_SIZE} />):
                                    (<IconInfoCircle size={ICON_SIZE} />)
                                }
                            </Table.Td>
                            <Table.Td>
                                {validateProposal.data?.info}
                            </Table.Td>
                        </Table.Tr>
                        {validateProposal.data?.warnings !== undefined &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconAlertCircle size={ICON_SIZE} />
                                </Table.Td>
                                <Table.Td>
                                    {validateProposal.data?.warnings}
                                </Table.Td>
                            </Table.Tr>)}
                        {validateProposal.data?.errors !== undefined &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconCircleX size={ICON_SIZE} />
                                </Table.Td>
                                <Table.Td>
                                    {validateProposal.data?.errors}
                                </Table.Td>
                            </Table.Tr>)}
                    </Table.Tbody>
                </Table>
            </Stack>
        </PanelFrame>
    );
}