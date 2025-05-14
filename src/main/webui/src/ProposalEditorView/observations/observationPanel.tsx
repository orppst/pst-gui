import {useProposalResourceGetObservingProposal,} from 'src/generated/proposalToolComponents';
import {useParams} from "react-router-dom";
import {RadioTableGenerator} from './radio/observationRadioTable.tsx';
import {Container, Grid, Group, List, Space} from "@mantine/core";
import {Observation} from "src/generated/proposalToolSchemas.ts";
import getErrorMessage from "src/errorHandling/getErrorMessage.tsx";
import {ReactElement, useContext} from 'react';
import ObservationEditModal from './radio/editRadio.modal.tsx';
import NavigationButton from 'src/commonButtons/navigation.tsx';
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {IconChartLine, IconTarget} from '@tabler/icons-react';
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {OpticalTableGenerator} from "./optical/observationOpticalTable";
import ObservationOpticalEditModal from "./optical/editOptical.modal";
import {useOpticalTelescopeResourceGetProposalObservationIds} from "../../util/telescopeComms";
import {POLARIS_MODES} from "../../constants";
import {ProposalContext} from "../../App2";


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
    const polarisMode = useContext(ProposalContext).mode;
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

    /**
     * builds the radio observations.
     *
     * @param observations: the array of observations for radio.
     * @param mode: the polaris observing mode.
     * @constructor
     */
    const RadioObservations = (
            observations:  Observation[], mode: POLARIS_MODES):
            ReactElement => {
        return (
            <>
                {(mode === POLARIS_MODES.BOTH) && (
                    <h2>Radio Observations</h2>
                )}
                {RadioTableGenerator(observations)}
                <Space h={"xl"}/>
                <Grid>
                    <Grid.Col span={10}></Grid.Col>
                    <ObservationEditModal/>
                </Grid>
            </>
        )
    }

    /**
     * builds the optical observations.
     *
     * @param observations: the array of observations for optical.
     * @param mode: the polaris observing mode.
     * @constructor
     */
    const OpticalObservations = (
            observations:  Observation[], mode: POLARIS_MODES):
            ReactElement => {
        return (
            <>
                {(mode === POLARIS_MODES.BOTH) && (
                  <h2>Optical Observations</h2>
                )}
                {OpticalTableGenerator(observations, true)}
                <Space h={"xl"}/>
                <Grid>
                    <Grid.Col span={10}></Grid.Col>
                    <ObservationOpticalEditModal/>
                </Grid>
            </>
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

    if (proposal.data?.targets === undefined ||
            (proposal.data?.technicalGoals === undefined && (
                polarisMode == POLARIS_MODES.RADIO ||
                polarisMode == POLARIS_MODES.BOTH))) {
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
                            (!proposal.data?.technicalGoals && (
                                polarisMode == POLARIS_MODES.RADIO ||
                                polarisMode == POLARIS_MODES.BOTH)) &&
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

        if (proposal.data.observations) {
            for (const observation of proposal.data.observations!) {
                if (backendIDs.includes(observation._id!)) {
                    opticalObservationsStore.push(observation);
                } else {
                    radioObservationsStore.push(observation);
                }
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

                {(polarisMode === POLARIS_MODES.BOTH ||
                    polarisMode === POLARIS_MODES.RADIO) && (
                        RadioObservations(
                            radioObservationsStore, polarisMode))}

                {(polarisMode === POLARIS_MODES.BOTH ||
                    polarisMode === POLARIS_MODES.OPTICAL) && (
                        OpticalObservations(
                            opticalObservationsStore, polarisMode))}
            </PanelFrame>
        )
    }
}

export default ObservationsPanel