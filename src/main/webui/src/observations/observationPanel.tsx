import {
    useObservationResourceGetObservations, useProposalResourceGetObservingProposalTitle, useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";
import ObservationsNewModal from "./new.modal.tsx";
import {Link, useParams} from "react-router-dom";
import ObservationRow, { observationTableHeader } from './observationTable.tsx';
import {Badge, Button, Group, Space, Table, Text} from "@mantine/core";
import {Observation} from "../generated/proposalToolSchemas.ts";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import { ReactElement } from 'react';


/**
 * the observation props.
 * @param {Observation | undefined} observation the observation object, or
 * undefined if not populated.
 * @param {number} observationId the observation id.
 * @param {boolean} newObservation a optional parameter stating if it is a new observation.
 * @param {() => void}} closeModal an optional close modal.
 */
export type ObservationProps = {
    observation: Observation | undefined,
    observationId: number, // needed as 'observation' does not contain its database id
    newObservation?: boolean, // this might be redundant i.e. observation === undefined contains the information
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
            <Observations />
        </>
    );

    //reminder we are getting lists of 'ObjectIdentifiers' which contain only a name and DB id for
    //the object specified i.e. we don't get any information on child objects.

    function Observations() {
        const { selectedProposalCode} = useParams();

        const { data: observations , error: observationsError, isLoading: observationsLoading } =
            useObservationResourceGetObservations(
                {pathParams: {proposalCode: Number(selectedProposalCode)},},
                {enabled: true}
            );


        const {data: targets, error: targetsError, isLoading: targetsLoading} =
            useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)}},
                {enabled: true}
            );

        const {data: titleData, error: titleError, isLoading: titleLoading} =
            useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: Number(selectedProposalCode)}}
            );

        if (observationsError) {
            return (
                <pre>{getErrorMessage(observationsError)}</pre>
            );
        }

        if (targetsError) {
            return (
                <pre>{getErrorMessage(targetsError)}</pre>
            )
        }

        if (titleError) {
            return (
                <pre>{getErrorMessage(titleError)}</pre>
            )
        }

        return (
            <div>
                <h3>
                    { titleLoading ?
                        <Badge size={"xl"} radius={0}>...</Badge> :
                        <Badge size={"xl"} radius={0}>{titleData}</Badge>
                    }
                    : Observations
                </h3>

                {observationsLoading ? (`Loading...`) :
                    <Table>
                        { observationTableHeader() }
                        <Table.Tbody>
                        {
                            observations?.map((observation) => {
                                return (
                                    <ObservationRow id={observation.dbid!} key={observation.dbid!} />
                                )
                            })
                        }
                        </Table.Tbody>
                    </Table>
                }

                <Space h={"xs"}/>

                <Group justify={'flex-end'}>
                    {targetsLoading ? (`Loading...`) :
                        targets!.length > 0 ?
                            <ObservationsNewModal/> :
                            <Group>
                            <Text c={"yellow"} mr={-5}>
                                To create an observation please add at least one
                            </Text>
                            <Button
                                variant={"subtle"}
                                p={5}
                                ml={-5}
                                to={"../proposal/" + selectedProposalCode + "/targets"}
                                component={Link}
                            >
                                target
                            </Button>
                            </Group>

                    }
                </Group>
            </div>
        );
    }

}

export default ObservationsPanel