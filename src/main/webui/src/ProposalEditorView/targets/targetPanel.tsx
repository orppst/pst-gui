import {
    useProposalResourceGetObservingProposal,
    useProposalResourceGetTargets,
} from 'src/generated/proposalToolComponents.ts';

import {useNavigate, useParams} from "react-router-dom";
import {Box, Group, Loader, Stack, Text} from '@mantine/core';
import { ReactElement } from 'react';
import { TargetTable } from './TargetTable.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";
import AddButton from "../../commonButtons/add.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AddListOfTargets from "./addListOfTargets.tsx";

/**
 * Renders the target panel containing an add target button
 * (from the add target modal) and a table of targets assigned to the
 * current proposal
 *
 *
 * @return {ReactElement} Returns a Mantine Box
 */
export function TargetPanel(): ReactElement {
    const navigate = useNavigate();

    const {selectedProposalCode} = useParams();
    const targets = useProposalResourceGetTargets(
        {pathParams: {proposalCode: Number(selectedProposalCode)},},
        {enabled: true});
    // needed to track which targets are locked into observations.
    const { data: proposalsData } =
        useProposalResourceGetObservingProposal({
                pathParams: {proposalCode: Number(selectedProposalCode),
                             doInvestigatorCheck: true},
            },
            {enabled: true}
        );

    if (targets.isLoading) {
        return (
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (targets.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load targets"}
                error={getErrorMessage(targets.error)}
            />
        )
    }

    // acquire all the bound targets ids in observations.
    let boundTargets: (number)[] = [0];

    proposalsData?.observations?.map((observation) => {
        observation.target?.map((id) => {
            boundTargets?.push(id as number);
        })
    })

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Targets"} />
            <ContextualHelpButton  messageId="MaintTargList" />
            {
                targets.data?.length! > 10 &&
                <Group justify={"center"}>
                    <AddButton
                        label={"Add One Target"}
                        toolTipLabel={"Add a single target"}
                        onClick={() => navigate("new")}
                    />
                    <AddListOfTargets
                        proposalCode={Number(selectedProposalCode)}
                    />
                </Group>
            }
            <Stack>
                {targets.data?.length === 0?
                    <Text>No targets have been added</Text> :
                    <Stack>
                        <Text>Total targets added: {targets.data?.length}</Text>
                        <TargetTable isLoading={targets.isLoading}
                                     data={targets.data}
                                     selectedProposalCode={selectedProposalCode}
                                     boundTargets={boundTargets}
                                     showButtons={true}
                                     selectedTargets={undefined}
                        />
                    </Stack>
                }
                <Group justify={"center"}>
                    <AddButton
                        label={"Add One Target"}
                        toolTipLabel={"Add a single target"}
                        onClick={() => navigate("new")}
                    />
                    <AddListOfTargets
                        proposalCode={Number(selectedProposalCode)}
                    />
                </Group>
            </Stack>
        </PanelFrame>
    );
}