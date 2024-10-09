import {
    useProposalResourceGetObservingProposal,
} from 'src/generated/proposalToolComponents';
import {useParams} from "react-router-dom";
import ObservationRow, { observationTableHeader } from './observationTable.tsx';
import {Container, Grid, Group, List, Space, Table} from "@mantine/core";
import {Observation} from "src/generated/proposalToolSchemas.ts";
import getErrorMessage from "src/errorHandling/getErrorMessage.tsx";
import { ReactElement } from 'react';
import ObservationEditModal from './edit.modal.tsx';
import NavigationButton from 'src/commonButtons/navigation.tsx';
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {IconTarget, IconChartLine, IconGeometry} from '@tabler/icons-react';
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";


/**
 * the observation props.
 * @param {Observation | undefined} observation the observation object or
 * undefined if not populated
 * @param {number} observationId the observation id - optional
 * @param {() => void}} closeModal an optional close modal - optional
 */
export type ObservationProps = {
    observation: Observation | undefined,
    selectedTargets: number[] | undefined,
    closeModal?: () => void
}

/**
 * generates the observation panel.
 * @return {ReactElement} the react html for the observation panel.
 * @constructor
 */
function ObservationsPanel(): ReactElement {
    return (
        <>
            <Observations/>
        </>
    );
}

//reminder we are getting lists of 'ObjectIdentifiers' which contain only a
// name and DB id for the object specified i.e. we don't get any information
// on child objects.
function Observations() {
    const { selectedProposalCode} = useParams();

    const proposal = useProposalResourceGetObservingProposal({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    if (proposal.isError) {
        return (
            <Container>
                Unable to load proposal: {getErrorMessage(proposal.error)}
            </Container>
        )
    }

    /**
     * generates the top header part of the panel.
     *
     * @return {React.ReactElement} the header dynamic HTML.
     * @constructor
     */
    const Header = (): ReactElement => {
        return (
            <PanelHeader
                isLoading={proposal.isLoading}
                itemName={proposal.data?.title!}
                panelHeading={"Observations"} />
        )
    }

    /**
     * generates the observation table html.
     *
     * @return {React.ReactElement} the dynamic html for the observation table.
     * @constructor
     */
    const TableGenerator = (): ReactElement => {
        return (
            <Table>
                { observationTableHeader() }
                <Table.Tbody>
                    {
                        proposal.data?.observations?.map((observation) => {
                            return (
                                <ObservationRow id={observation._id!}
                                                key={observation._id!} />
                            )
                        })
                    }
                </Table.Tbody>
            </Table>
        )
    }

    /**
     * produces the dynamic html for the technical goal button.
     * @return {React.ReactElement} the dynamic html for the button.
     * @constructor
     */
    const TechnicalGoalButton = (): ReactElement => {
        return (
            <NavigationButton
                toolTipLabel={"Go to Technical Goals page"}
                p={5}
                ml={-5}
                icon={IconChartLine}
                to={"../proposal/" + selectedProposalCode + "/goals"}
                label={"at least one technical goal"}/>
        )
    }

    /**
     * produces the dynamic html for the target button.
     * @return {React.ReactElement} the dynamic html for the button.
     * @constructor
     */
    const TargetButton = (): ReactElement => {
        return (
            <NavigationButton
                toolTipLabel={"Go to Targets page"}
                p={5}
                ml={-5}
                icon={IconTarget}
                to={"../proposal/" + selectedProposalCode + "/targets"}
                label={"at least one target"}/>
        )
    }

    const ObservationFieldButton = () : ReactElement => {
        return (
            <NavigationButton
                p={5}
                ml={-5}
                to={"../proposal/" + selectedProposalCode + "/observationFields"}
                icon={IconGeometry}
                toolTipLabel={"Go to Observation Fields page"}
                label={"at least one observation field"}
            />
        )
    }



    // if still loading. present a loading screen.
    if (proposal.isLoading) {
        return (
            <PanelFrame>
                <Header/>
                <Space h={"xs"}/>
                <Group justify={'flex-end'}>
                    `Loading...`
                </Group>
            </PanelFrame>
        )
    }

    if (proposal.data?.targets === undefined ||
        proposal.data?.technicalGoals === undefined ||
        proposal.data?.fields === undefined) {
        return (
            <PanelFrame>
                <Header/>
                    To create an observation please add the following:
                    <List>
                        {
                            !proposal.data?.targets &&
                            <List.Item>
                                <TargetButton/>
                            </List.Item>
                        }
                        {
                            !proposal.data?.technicalGoals &&
                            <List.Item>
                                <TechnicalGoalButton/>
                            </List.Item>
                        }
                        {
                            !proposal.data?.fields &&
                            <List.Item>
                                <ObservationFieldButton/>
                            </List.Item>
                        }
                    </List>

            </PanelFrame>
        )
    } else {
        //all requirements met
        return (
            <PanelFrame>
                <Header/>
                <Grid>
                   <Grid.Col span={10}></Grid.Col>
                   <ContextualHelpButton messageId="MaintObsList" />
                </Grid>

                <TableGenerator/>
                <Space h={"xl"}/>
                <Grid>
                   <Grid.Col span={10}></Grid.Col>
                    <ObservationEditModal observation={undefined} selectedTargets={undefined}/>
                </Grid>
            </PanelFrame>
        )
    }
}

export default ObservationsPanel