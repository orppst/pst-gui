import {
    useObservationResourceGetObservations, useProposalResourceGetObservingProposalTitle, useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";
import ObservationsNewModal from "./new.modal.tsx";
import {useParams} from "react-router-dom";
import RenderObservation from "./RenderObservation.tsx";
import {Button, Group, Space, Table} from "@mantine/core";


export type TargetId = {id: number | undefined};

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
                {enabled: true});
      //  const navigate = useNavigate();


        const {data: targets, error: targetsError, isLoading: targetsLoading} =
            useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)}},
                {enabled: true});

        const {data: titledata, error: titleError, isLoading: titleLoading} =
        useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: Number(selectedProposalCode)}}
        )

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
                <h3>Observations for { titleLoading ? '...' : "'" + titledata + "'"} </h3>

                {observationsLoading ? (`Loading...`) :
                    <Table>
                        <thead>
                        <tr>
                            <th>Target name</th>
                            <th>Observation type</th>
                            <th>Field</th>
                            <th>Technical goals</th>
                            <th>Timing windows</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            observations?.map((observation) => {
                                return (
                                    <RenderObservation
                                        proposalCode={Number(selectedProposalCode)}
                                        dbid={observation.dbid!}
                                    />
                                )
                            })
                        }
                        </tbody>
                    </Table>
                }

                <Space h={"xs"}/>

                <Group position={"right"}>
                    {targetsLoading ? (`Loading...`) :
                        targets!.length > 0 ?
                            <ObservationsNewModal id={targets!.at(0)!.dbid}/> :
                            <Button>add a target</Button>
                    }
                </Group>
            </div>
        );
    }

}

export default ObservationsPanel