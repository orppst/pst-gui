import {
    useObservationResourceGetObservations,
    useProposalResourceGetObservingProposalTitle,
    useProposalResourceGetTargets,
    useTechnicalGoalResourceGetTechnicalGoals,
} from 'src/generated/proposalToolComponents';
import {useParams} from "react-router-dom";
import ObservationRow, { observationTableHeader } from './observationTable.tsx';
import {Badge, Container, Group, Space, Table, Title} from "@mantine/core";
import {Observation} from "src/generated/proposalToolSchemas.ts";
import getErrorMessage from "src/errorHandling/getErrorMessage.tsx";
import { ReactElement } from 'react';
import ObservationEditModal from './edit.modal.tsx';
import NavigationButton from 'src/commonButtons/navigation.tsx';
import { IconTarget, IconChartLine } from '@tabler/icons-react';


/**
 * the observation props.
 * @param {Observation | undefined} observation the observation object or
 * undefined if not populated
 * @param {number} observationId the observation id - optional
 * @param {() => void}} closeModal an optional close modal - optional
 */
export type ObservationProps = {
    observation: Observation | undefined,
    // needed as 'observation' does not contain its database id
    observationId?: number,
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

    // get any observations from the database.
    const {
        data: observations ,
        error: observationsError,
        isLoading: observationsLoading } =
            useObservationResourceGetObservations(
                {pathParams: {proposalCode: Number(selectedProposalCode)},},
                {enabled: true}
            );


    // get any targets.
    const {data: targets, error: targetsError, isLoading: targetsLoading} =
        useProposalResourceGetTargets(
            {pathParams: {proposalCode: Number(selectedProposalCode)}},
            {enabled: true}
        );

    // get any technical goals.
    const {data: technicalGoals, error: technicalGoalError,
           isLoading: technicalGaolsLoading} =
        useTechnicalGoalResourceGetTechnicalGoals(
            {pathParams: {proposalCode: Number(selectedProposalCode)}},
            {enabled: true}
        );

    // get the title of the proposal.
    const {data: titleData, error: titleError, isLoading: titleLoading} =
        useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: Number(selectedProposalCode)}}
        );

    /**
     * generates the top header part of the panel.
     *
     * @return {React.ReactElement} the header dynamic HTML.
     * @constructor
     */
    const Header = (): ReactElement => {
        return (
            <Title order={3}>
                { titleLoading ?
                    <Badge size={"xl"} radius={0}>...</Badge> :
                    <Badge size={"xl"} radius={0}>{titleData}</Badge>
                }
                : Observations
            </Title>
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
                        observations?.map((observation) => {
                            return (
                                <ObservationRow id={observation.dbid!}
                                                key={observation.dbid!} />
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
    const TechnicalGaolButton = (): ReactElement => {
        return (
            <NavigationButton
                toolTipLabel={
                    "Click to be routed to the technical goal page."}
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
                toolTipLabel={"Click to be routed to the target page."}
                p={5}
                ml={-5}
                icon={IconTarget}
                to={"../proposal/" + selectedProposalCode + "/targets"}
                label={"at least one target"}/>
        )
    }

    // process any errors.
    const possibleErrors: (
        {status: "unknown", payload: string} | null | undefined) [] = [
            observationsError, targetsError, titleError, technicalGoalError];
    const filtered: {status: "unknown", payload: string}[] =
        possibleErrors.flatMap(f => f ? [f] : []);
    if (filtered.length !== 0) {
        let messages = "";
        filtered.forEach((error: { status: "unknown", payload: string }) => {
            messages = messages + " " + getErrorMessage(error);
        })
        return (<pre>messages</pre>);
    }

    // if still loading. present a loading screen.
    if (targetsLoading || observationsLoading || technicalGaolsLoading ) {
        return (
            <Container fluid>
                <Header/>
                <Space h={"xs"}/>
                <Group justify={'flex-end'}>
                    `Loading...`
                </Group>
            </Container>
        )
    }

    if (targets?.length === 0 || technicalGoals?.length === 0) {
        return (
            <Container fluid>
                <Header/>
                <Group>
                    To create an observation please add
                    {
                        targets?.length === 0 &&
                        <>
                            <TargetButton/>
                            {technicalGoals?.length === 0 && " and "}
                        </>
                    }
                    {
                        technicalGoals?.length == 0 &&
                        <TechnicalGaolButton/>
                    }
                </Group>
            </Container>
        )
    } else {
        //both targets.length and technicalGoals.length are greater than zero here
        return (
            <Container fluid>
                <Header/>
                <TableGenerator/>
                <Space h={"xl"}/>
                <Group justify={'center'}>
                    <ObservationEditModal observation={undefined}/>
                </Group>
            </Container>
        )
    }
}

export default ObservationsPanel