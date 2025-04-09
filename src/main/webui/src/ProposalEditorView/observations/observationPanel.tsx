import {
    useProposalResourceGetObservingProposal,
} from 'src/generated/proposalToolComponents';
import {useParams} from "react-router-dom";
import { RadioTableGenerator} from './radio/observationRadioTable.tsx';
import {Container, Grid, Group, List, Space} from "@mantine/core";
import {Observation} from "src/generated/proposalToolSchemas.ts";
import getErrorMessage from "src/errorHandling/getErrorMessage.tsx";
import { ReactElement } from 'react';
import ObservationEditModal from './radio/editRadio.modal.tsx';
import NavigationButton from 'src/commonButtons/navigation.tsx';
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {IconTarget, IconChartLine} from '@tabler/icons-react';
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {OpticalTableGenerator} from "./optical/observationOpticalTable";
import ObservationOpticalEditModal from "./optical/editOptical.modal";
import {useOpticalTelescopeResourceGetProposalObservationIds} from "../../util/telescopeComms";


/**
 * the observation props.
 * @param {Observation} observation the observation object or undefined if not populated
 * @param {() => void}} closeModal an optional close modal - optional
 */
export type ObservationProps = {
    observation?: Observation,
    closeModal?: () => void
}

/**
 * generates the observation panel.
 * @return {ReactElement} the react html for the observation panel.
 * @constructor
 */
function ObservationsPanel(): ReactElement {
    return (<Observations/>);
}

//reminder we are getting lists of 'ObjectIdentifiers' which contain only a
// name and DB id for the object specified i.e. we don't get any information
// on child objects.
function Observations() {
    let { selectedProposalCode} = useParams();
    selectedProposalCode = selectedProposalCode!;

    const proposal = useProposalResourceGetObservingProposal({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })
    const opticalObservations =
        useOpticalTelescopeResourceGetProposalObservationIds(
            {proposalID: selectedProposalCode}
        )

    if (proposal.isError) {
        return (
            <Container>
                Unable to load proposal:
                {getErrorMessage(proposal.error)}
            </Container>
        )
    }
    if (opticalObservations.isError) {
        return (
            <Container>
                Unable to load optical observations:
                {getErrorMessage(opticalObservations.error)}
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
        const titleRaw = proposal.data?.title;
        const title = titleRaw!;
        return (
            <PanelHeader
                isLoading={proposal.isLoading}
                itemName={title}
                panelHeading={"Observations"}
            />
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

    // if still loading. present a loading screen.
    if (proposal.isLoading || opticalObservations.isLoading) {
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

    if (proposal.data?.targets === undefined || proposal.data?.technicalGoals === undefined) {
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
                    </List>
            </PanelFrame>
        )
    } else {
        const opticalObservationsStore: Observation[] = [];
        const radioObservationsStore: Observation [] = [];
        const backendIDs: number [] = opticalObservations.data!;

        for( const observation of proposal.data.observations!) {
            if (backendIDs.includes(observation._id!)) {
                opticalObservationsStore.push(observation);
            } else {
                radioObservationsStore.push(observation);
            }
        }

        //all requirements met
        return (
            <PanelFrame>
                <Header/>
                <Grid>
                   <Grid.Col span={10}></Grid.Col>
                   <ContextualHelpButton messageId="MaintObsList" />
                </Grid>

                {RadioTableGenerator(radioObservationsStore)}

                <Space h={"xl"}/>
                <Grid>
                   <Grid.Col span={10}></Grid.Col>
                    <ObservationEditModal/>
                </Grid>

                {OpticalTableGenerator(opticalObservationsStore)}

                <Space h={"xl"}/>
                <Grid>
                    <Grid.Col span={10}></Grid.Col>
                    <ObservationOpticalEditModal/>
                </Grid>
            </PanelFrame>
        )
    }
}

export default ObservationsPanel