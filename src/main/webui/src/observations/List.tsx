import {
    useObservationResourceGetObservations,
} from "../generated/proposalToolComponents";
//import {useNavigate} from "react-router-dom";
import ObservationsNewModal from "./new.modal.tsx";
import {useParams} from "react-router-dom";


export type TargetId = {id: number | undefined};

function ObservationsPanel() {

    return (
        <>
            <Observations />
        </>
    );

    function Observations() {
        const { selectedProposalCode} = useParams();

        const { data , error, isLoading } = useObservationResourceGetObservations({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});
      //  const navigate = useNavigate();


        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        //FIXME: the 'data' for the conditional should be a list of targets that have been added, rather than
        // the list of observations added. We still want to display the observations added.

        return (
            <div>
                <h3>This where observations will be managed for </h3>
                {isLoading ? (`Loading...`) :
                    data!.length > 0 ?
                        <ObservationsNewModal id={data!.at(0)!.dbid}/> :
                        <p>WIP: No targets added. Go to 'Targets' tab and add at least one target.</p>
                }

                <fieldset>
                    {isLoading ? (`Loading...`)
                        : (
                            <pre>
                                {`${JSON.stringify(data, null, 2)}`}
                            </pre>
                        )}
                </fieldset>
            </div>
        );
    }

}

export default ObservationsPanel