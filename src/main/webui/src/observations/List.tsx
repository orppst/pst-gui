import {
    useObservationResourceGetObservations, useProposalResourceGetObservingProposalTitle, useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";
import ObservationsNewModal from "./new.modal.tsx";
import {Link, useParams} from "react-router-dom";
import ObservationRow from "./table.row.tsx";
import {Badge, Button, Group, Space, Table, Text} from "@mantine/core";
import {Observation} from "../generated/proposalToolSchemas.ts";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";


export type ObservationProps = {
    observation: Observation | undefined,
    newObservation?: boolean,
    closeModal?: () => void
}

/*
       TODO:
       1. provide better UX for errors
       2. provide functionality to edit an observation
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