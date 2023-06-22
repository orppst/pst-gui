import { useContext } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";

function SummaryPanel() {

    return (
        <>
            <DisplaySummary />
        </>
    );

    function DisplaySummary() {
        const { selectedProposal } = useContext(UserContext) as AppContextType;
        const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div>
                <h3>This to become nicely formatted summary of the selected proposal</h3>
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

export default SummaryPanel