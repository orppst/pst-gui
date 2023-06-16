import {useReducer, useContext, useState} from "react";
import {AppContextType, UserContext} from '../App2'
import {
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, ObservingProposal} from "../generated/proposalToolSchemas.ts";

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
        const { user, setSelectedProposal, setNavPanel } = useContext(UserContext) as AppContextType;
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
            const investigator : Investigator = {
                "@type": "proposal:Investigator",
                "type": "PI",
                "person": user
            };

            console.log("Create new proposal with " + JSON.stringify(formData));
            fetchProposalResourceCreateObservingProposal({ body: {"@type": "ObservingProposal", ...formData, "investigators": [investigator]}})
                .then(setSubmitting(false))
                .then((data : ObservingProposal) => setSelectedProposal(data._id))
                .then(setNavPanel('summary'))
                .catch(console.log);
        }

        function handleChange(event) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div className="main-forms">
                Create Proposal
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <label>Title</label>
                        <input name="title" onChange={handleChange} />
                        <label>Summary</label>
                        <textarea rows="3" name="summary" onChange={handleChange} />
                        <label>Kind<br/></label>
                        <select name="kind" onChange={handleChange}>
                            <option value="">--Please choose an option--</option>
                            <option value="STANDARD">Standard</option>
                        </select>
                        <br />
                        <button type="submit" >Create</button>
                    </fieldset>
                </form>
            </div>
        );
    }

}

export default NewProposalPanel