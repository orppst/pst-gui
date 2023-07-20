import { useContext } from "react";
import {ProposalContext} from '../App2'
import {
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";

function OverviewPanel() {
    const { selectedProposalCode } = useContext(ProposalContext);
    const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div>
            <h3>This will become nicely formatted overview of the selected proposal</h3>
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

export default OverviewPanel