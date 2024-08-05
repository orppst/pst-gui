import {
    useProposalResourceGetObservingProposal,
    useProposalResourceGetTargets,
} from 'src/generated/proposalToolComponents.ts';

import AddTargetModal from "./New";
import {useParams} from "react-router-dom";
import {Grid, Box, Stack} from '@mantine/core';
import { ReactElement } from 'react';
import { JSON_SPACES } from 'src/constants.tsx';
import { TargetTable } from './TargetTable.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx"

/**
 * Renders the target panel containing an add target button
 * (from the add target modal) and a table of targets assigned to the
 * current proposal
 *
 *
 * @return {ReactElement} Returns a Mantine Box
 */
export function TargetPanel(): ReactElement {
    const {selectedProposalCode} = useParams();
    const {data, error, isLoading} = useProposalResourceGetTargets(
        {pathParams: {proposalCode: Number(selectedProposalCode)},},
        {enabled: true});
    // needed to track which targets are locked into observations.
    const { data: proposalsData } =
        useProposalResourceGetObservingProposal({
                pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true}
        );

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    // acquire all the bound targets ids in observations.
    let boundTargets: (number | undefined)[] | undefined;
    boundTargets = proposalsData?.observations?.map((observation) => {
        // extract the id. it seems the technical Goal returned here IS a number
        // not the TechnicalGoal object it advertises.
        return observation.target as number;
    });

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Targets"} />
            <ContextualHelpButton  messageId="MaintTargList" />
            <Stack>
                {data?.length === 0?
                    <div>Please add your targets</div> :
                    <TargetTable isLoading={isLoading}
                                 data={data}
                                 selectedProposalCode={selectedProposalCode}
                                 boundTargets={boundTargets}
                                 showButtons={true}
                                 selectedTarget={undefined}/>
                }

            </Stack>
                        <p> </p>
                        <Grid>
                          <Grid.Col span={10}></Grid.Col>
                                          <AddTargetModal/>
                                          </Grid>
                                          <p> </p>
        </PanelFrame>
    );
}