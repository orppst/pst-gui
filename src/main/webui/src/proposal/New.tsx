import {useReducer, useContext, useState, useEffect} from "react";
import { UserContext } from '../App2'
import {
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents.ts";

function formReducer(state, event) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function NewProposalPanel() {

    return (
        <>
            <DisplayNewProposal />
        </>
    );

    function DisplayNewProposal() {
        const { user, selectedProposal, setSelectedProposal, setNavPanel } = useContext(UserContext);
        const [formData, setFormData] = useReducer(formReducer, {});
        const [submitting, setSubmitting] = useState(false);

        function handleSubmit(event) {
            event.preventDefault();

            setSubmitting(true);
            //Don't allow a blank title
            if(formData.value === "") {
                setFormData({name: "title", value: 'empty'});
            }

            //Add the current user as the PI
            var investigator = {
                "@type": "proposal:Investigator",
                "type": "PI",
                "forPhD": false,
                "person": user
            };

            fetchProposalResourceCreateObservingProposal({ body: {"@type": "ObservingProposal", ...formData, "investigators": [investigator]}})
                .then(setSubmitting(false))
                .then(setSelectedProposal(0))
                .then(setNavPanel('welcome'))
                .catch(console.log);
        }

        function handleChange(event) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div>
                <h3>Create Proposal</h3>
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <label>
                            <p>Title</p>
                            <input name="title" onChange={handleChange} />
                            <p>Summary</p>
                            <input name="summary" onChange={handleChange} />
                            <p>Kind</p>
                            <select name="kind" onChange={handleChange}>
                                <option value="">--Please choose an option--</option>
                                <option value="STANDARD">Standard</option>
                            </select>
                            <br />
                            <button type="submit" >Create</button>
                        </label>
                    </fieldset>
                </form>
            </div>
        );
    }

}

export default NewProposalPanel