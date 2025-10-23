import {IconAlertCircle, IconCircleCheck, IconCircleX, IconInfoCircle} from '@tabler/icons-react';
import {Box, Divider, Loader, NavLink, Stack, Table, Text} from "@mantine/core";
import {ICON_SIZE} from "src/constants.tsx";
import {
    useProposalCyclesResourceGetProposalCycleDetails, useProposalCyclesResourceGetProposalCycleObservatory,
    useProposalCyclesResourceGetProposalCycleTitle,
    useProposalResourceValidateObservingProposal
} from "src/generated/proposalToolComponents.ts";
import {Link, useParams} from "react-router-dom";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ReactElement, useEffect} from "react";
import React from 'react';

export default function ValidationOverview(props: {
    cycle: number,
    smallScreen?: boolean,
    setProposalCheck: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {

    const { selectedProposalCode } = useParams();

    const validateProposal = useProposalResourceValidateObservingProposal({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            queryParams: {cycleId: props.cycle}}
        );

    const cycleTitle = useProposalCyclesResourceGetProposalCycleTitle({
        pathParams: {cycleCode: props.cycle}
    })

    const cycleDates = useProposalCyclesResourceGetProposalCycleDetails(
        {pathParams: {cycleCode: props.cycle}});

    const observatory = useProposalCyclesResourceGetProposalCycleObservatory({
            pathParams: {cycleCode: props.cycle}
        })

    useEffect(() => {
        if (validateProposal.status === 'success') {
            props.setProposalCheck(validateProposal.data.isValid!)
        }
    }, [validateProposal]);

    if (validateProposal.isLoading || cycleTitle.isLoading || cycleDates.isLoading || observatory.isLoading) {
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

    const formatTextWithLinks = (p : {text: string, color: string}) : ReactElement => {
        return (
            <Table.Td>
                {p.text.replace('<br/>$', 'g')
                .split("<br/>")
                .map((s, index) => (
                    s.length > 0 &&
                    <React.Fragment key={index}>
                        {s.includes("No observations defined")||s.includes("A timing window for")?
                            <NavLink to={"/proposal/"+selectedProposalCode+"/observations"}
                                     component={Link} label={s} c={p.color} />
                            :s.includes("No targets defined")?
                                <NavLink to={"/proposal/"+selectedProposalCode+"/targets"}
                                         component={Link} label={s} c={p.color}/>
                                :s.includes("No technical goals defined")?
                                    <NavLink to={"/proposal/"+selectedProposalCode+"/goals"}
                                             component={Link} label={s} c={p.color}/>
                                        :s.includes("Justification PDF") || s.includes("justification")?
                                            <NavLink to={"/proposal/"+selectedProposalCode+"/justifications"}
                                                component={Link} label={s} c={p.color}/>
                                        :<Text size={"sm"} c={p.color}>{s}</Text>
                        }
                    </React.Fragment>
                ))}
            </Table.Td>)
    }

    return (
        <PanelFrame
            maw={props.smallScreen ? "100%": "75%"}
            ml={props.smallScreen ? "" : "10%"}
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
                                    (<IconCircleCheck size={ICON_SIZE} color={'green'}/>):
                                    (<IconInfoCircle size={ICON_SIZE} color={'orange'}/>)
                                }
                            </Table.Td>
                            <Table.Td>
                                {validateProposal.data?.info &&
                                    formatTextWithLinks({text: validateProposal.data?.info,
                                        color: validateProposal.data?.isValid ? 'green' : 'orange'})
                                }
                            </Table.Td>
                        </Table.Tr>
                        {validateProposal.data?.warnings !== undefined &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconAlertCircle size={ICON_SIZE} color={'orange'}/>
                                </Table.Td>
                                {formatTextWithLinks({text: validateProposal.data.warnings, color: 'orange'})}
                            </Table.Tr>)}
                        {validateProposal.data?.errors !== undefined &&
                            (<Table.Tr>
                                <Table.Td>
                                    <IconCircleX size={ICON_SIZE} color={'red'}/>
                                </Table.Td>
                                {formatTextWithLinks({text: validateProposal.data.errors, color: 'red'})}
                            </Table.Tr>)}
                    </Table.Tbody>
                </Table>
            </Stack>
        </PanelFrame>
    );
}