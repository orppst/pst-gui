import {
    useObservationResourceGetObservations, useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";
//import {useNavigate} from "react-router-dom";
import ObservationsNewModal from "./new.modal.tsx";
import {useParams} from "react-router-dom";


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

    function Observations() {
        const { selectedProposalCode} = useParams();

        const { data , error, isLoading } =
            useObservationResourceGetObservations(
                {pathParams: {proposalCode: Number(selectedProposalCode)},},
                {enabled: true});
      //  const navigate = useNavigate();


        const {data: targets, error: targetsError, isLoading: targetsLoading} =
            useProposalResourceGetTargets({pathParams: {proposalCode: Number(selectedProposalCode)}},
                {enabled: true});

        if (error) {
            return (
                <div>
                    needs work
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        if (targetsError) {
            return (
                <div>
                    needs work
                    <pre>{JSON.stringify(targetsError, null, 2)}</pre>
                </div>
            )
        }

        return (
            <div>
                <h3>This where observations will be managed for </h3>
                {targetsLoading ? (`Loading...`) :
                    targets!.length > 0 ?
                        <ObservationsNewModal id={targets!.at(0)!.dbid}/> :
                        <p>WIP: No targets added. Go to 'Targets' tab and add at least one target.</p>
                }

                <fieldset>
                    {isLoading ? (`Loading...`)
                        : (
                            <pre>
                                needs work
                                {`${JSON.stringify(data, null, 2)}`}
                            </pre>
                        )}
                </fieldset>
            </div>
        );
    }

}

export default ObservationsPanel