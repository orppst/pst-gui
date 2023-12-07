import {
    useObservationResourceGetObservations,
    useProposalResourceGetObservingProposalTitle,
    useProposalResourceGetTargets,
    useTechnicalGoalResourceGetTechnicalGoals,
} from '../generated/proposalToolComponents';
import {useParams} from "react-router-dom";
import ObservationRow, { observationTableHeader } from './observationTable.tsx';
import {Badge, Group, Space, Table} from "@mantine/core";
import {Observation} from "../generated/proposalToolSchemas.ts";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import { ReactElement } from 'react';
import ObservationEditModal from './edit.modal.tsx';
import NavigationButton from '../commonButtons/navigation.tsx';
import { IconTarget, IconChartLine } from '@tabler/icons-react';



/**
 * the observation props.
 * @param {Observation | undefined} observation the observation object, or
 * undefined if not populated.
 * @param {number} observationId the observation id.
 * @param {boolean} newObservation a optional parameter stating if it is a new
 * observation.
 * @param {() => void}} closeModal an optional close modal.
 */
export type ObservationProps = {
    observation: Observation | undefined,
    // needed as 'observation' does not contain its database id
    observationId?: number,
    // this might be redundant i.e. observation === undefined contains the
    // information
    newObservation: boolean,
    closeModal?: () => void
}

/*
       TODO:
       1. provide better UX for errors
       2. provide functionality to edit an observation
 */

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
            <h3>
                { titleLoading ?
                    <Badge size={"xl"} radius={0}>...</Badge> :
                    <Badge size={"xl"} radius={0}>{titleData}</Badge>
                }
                : Observations
            </h3>
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
            <div>
                <Header/>
                <Space h={"xs"}/>
                <Group justify={'flex-end'}>
                    `Loading...`
                </Group>
            </div>
        )
    }

    // if no targets available, but technical goals exist, present a button to
    // route the user back to targets
    if (targets!.length === 0 && technicalGoals!.length !== 0) {
        return (
            <div>
                <Header/>
                <Group>
                    To create an observation please add:
                    <TargetButton/>
                </Group>
            </div>
        );
    }

    // if no technical goals available, but targets exist, present a button to
    // route the user back to technical goals
    if (technicalGoals!.length === 0 && targets!.length !== 0) {
        return (
            <div>
                <Header/>
                <Group>
                    To create an observation please add:
                    <TechnicalGaolButton/>
                </Group>
            </div>
        );
    }

    // if no technical goals or targets available. presnet buttons to route to
    // either targets or technical goals.
    if (technicalGoals!.length === 0 && targets!.length === 0) {
        return (
            <div>
                <Header/>
                <Group>
                    To create an observation please add:
                    <TargetButton/>
                    and
                    <TechnicalGaolButton/>
                </Group>
            </div>
        );
    }



    // generate the table as we're in a safe state to do so.
    return (
        <div>
            <Header/>
            <TableGenerator/>
            <Group justify={'flex-end'}>
                <ObservationEditModal
                    observation={undefined}
                    newObservation={true}
                />
            </Group>
        </div>
    );
}

export default ObservationsPanel