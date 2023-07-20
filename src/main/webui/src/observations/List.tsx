import { useContext } from "react";
import {ProposalContext, UserContext} from '../App2'
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
        const { selectedProposalCode } = useContext(ProposalContext) ;
        const { data , error, isLoading } = useObservationResourceGetObservations({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});
        const navigate = useNavigate();


        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        function handleAddNew(event: React.SyntheticEvent) {
            event.preventDefault();
            navigate("/pst/app/proposal/" + selectedProposalCode + "/observations/new");
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