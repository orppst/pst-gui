import {SyntheticEvent, useContext} from "react";
import {ProposalContext} from '../App2'
import {
    useObservationResourceGetObservations,
} from "../generated/proposalToolComponents";
import {useNavigate} from "react-router-dom";

function ObservationsPanel() {

    return (
        <>
            <Observations />
        </>
    );

    function Observations() {
        const { user, selectedProposalCode } = useContext(ProposalContext) ;
        const { data , error, isLoading } = useObservationResourceGetObservations({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});
        const navigate = useNavigate();


        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        function handleAddNew(event: SyntheticEvent) {
            event.preventDefault();
            navigate( "new");
        }

        return (
            <div>
                <button className={"btn btn-primary"} onClick={handleAddNew} >Add New</button>
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