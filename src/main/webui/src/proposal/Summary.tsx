import { useReducer, useContext, useState } from "react";
import { UserContext } from '../App2'
import {
    useProposalResourceGetObservingProposal,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";

function formReducer(state, event) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function SummaryPanel() {

    return (
        <>
            <DisplaySummary />
        </>
    );

    function DisplaySummary() {
        const { user, selectedProposal, setSelectedProposal } = useContext(UserContext);
        const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
        const [formData, setFormData] = useReducer(formReducer, {title: data});
        const [submitting, setSubmitting] = useState(false);

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        function handleSubmit(event) {
            event.preventDefault();

            setSubmitting(true);

            setSubmitting(false);
        }

        function handleChange(event) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div>
                <h3>A nicely formatted summary of the selected proposal</h3>
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        {isLoading ? (`Loading...`)
                            : (
                                <div>
                                    {`${JSON.stringify(data)}`}
                                </div>
                            )}
                    </fieldset>
                </form>
            </div>
        );
    }

}

export default SummaryPanel