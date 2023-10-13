import {
    useObservationResourceGetObservations, useProposalResourceGetObservingProposalTitle, useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";
import ObservationsNewModal from "./new.modal.tsx";
import {useParams} from "react-router-dom";
import ObservationRow from "./table.row.tsx";
import {Badge, Button, Group, Space, Table} from "@mantine/core";
import {Observation} from "../generated/proposalToolSchemas.ts";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";


export type TargetId = {
    id: number,
};

export type ObservationProps = {
    observation: Observation,
    id: number
}

export type ObservationTargetProps = {
    observationProps: ObservationProps | undefined,
    targetId: number | undefined,
    techGoalId?: number | undefined,
    fieldId?: number | undefined,
    newObservation: boolean,
    closeModal?: () => void
}

/*
       TODO:
       1. provide better UX for errors
       2. provide functionality to edit an observation
       3. provide functionality to remove an observation
       4. display the observations in a formatted way
       5. if the targets list is empty provide a nav-link to the Targets page instead of just a prompt
 */


function ObservationsPanel() {

    return (
        <>
            <Observations />
        </>
    );

    //reminder we are getting lists of 'ObjectIdentifiers' which contain only a name and DB id for
    //the object specified i.e. we don't get any information on child objects

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
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Target name</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Field</Table.Th>
                            <Table.Th>Performance params</Table.Th>
                            <Table.Th>Spectral windows</Table.Th>
                            <Table.Th>Timing windows</Table.Th>
                            <Table.Th></Table.Th>
                        </Table.Tr>
                        </Table.Thead>
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
                            <Button>add a target</Button>
                    }
                </Group>
            </div>
        );
    }

}

export default ObservationsPanel