import { useContext } from "react";
import { UserContext} from '../App2'
import {
    useObservationResourceGetObservations,
} from "../generated/proposalToolComponents";

function ObservationsPanel() {

    return (
        <>
            <Observations />
        </>
    );

    function Observations() {
        const { selectedProposal } = useContext(UserContext) ;
        const { data , error, isLoading } = useObservationResourceGetObservations({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div>
                <h3>This where observations will be managed</h3>
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