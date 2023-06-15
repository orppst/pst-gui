import { useReducer, useContext, useState } from "react";
import { UserContext } from '../App2'
import {
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";

function formReducer(state, event) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function TargetPanel() {

    return (
        <>
            <DisplayTargets />
        </>
    );

    function DisplayTargets() {
        const { user, selectedProposal, setSelectedProposal } = useContext(UserContext);
        const { data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
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
                <h3>Add and edit targets</h3>
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

export default TargetPanel