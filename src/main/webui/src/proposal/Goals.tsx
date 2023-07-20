import { useContext } from "react";
import {ProposalContext} from '../App2'
import {
    useProposalResourceGetTechnicalGoals,
} from "../generated/proposalToolComponents";

function GoalsPanel() {
    const { selectedProposalCode } = useContext(ProposalContext);
    const { data , error, isLoading } = useProposalResourceGetTechnicalGoals({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div>
            <h3>This is where technical goals will be managed</h3>
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

export default GoalsPanel