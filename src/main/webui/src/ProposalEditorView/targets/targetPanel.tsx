import {
    useProposalResourceGetObservingProposal,
    useProposalResourceGetTargets,
} from 'src/generated/proposalToolComponents.ts';

import {useNavigate, useParams} from "react-router-dom";
import {Box, Group, Loader, Stack} from '@mantine/core';
import { ReactElement } from 'react';
import { TargetTable } from './TargetTable.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";
import AddButton from "../../commonButtons/add.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

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
                pathParams: {proposalCode: Number(selectedProposalCode)},},
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
            <Stack>
                {targets.data?.length === 0?
                    <div>Please add your targets</div> :
                    <TargetTable isLoading={targets.isLoading}
                                 data={targets.data}
                                 selectedProposalCode={selectedProposalCode}
                                 boundTargets={boundTargets}
                                 showButtons={true}
                                 selectedTargets={undefined}/>
                }
                <Group justify={"flex-end"}>
                    <AddButton
                        toolTipLabel={"Add a target"}
                        onClick={() => navigate("new")}
                    />
                </Group>
            </Stack>
        </PanelFrame>
    );
}