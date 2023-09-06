import { useContext} from "react";
import {ProposalContext} from '../App2'
import {
    useObservationResourceGetObservations,
} from "../generated/proposalToolComponents";
//import {useNavigate} from "react-router-dom";
import ObservationsNewModal from "./observations.new.modal.tsx";

function ObservationsPanel() {

    return (
        <>
            <Observations />
        </>
    );

    function Observations() {
        const {  selectedProposalCode } = useContext(ProposalContext) ;
        const { data , error, isLoading } = useObservationResourceGetObservations({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});
      //  const navigate = useNavigate();


        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div>
                <h3>This where observations will be managed for </h3>
                <ObservationsNewModal />
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