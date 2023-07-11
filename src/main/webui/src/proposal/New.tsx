import React, {useReducer, useContext, useState} from "react";
import {AppContextType, UserContext, formReducer} from '../App2'
import {
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, ObservingProposal} from "../generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";

function NewProposalPanel() {

    return (
        <>
            <DisplayNewProposal />
        </>
    );

    function DisplayNewProposal() {
        const { user, setSelectedProposal, selectedProposal } = useContext(UserContext) as AppContextType;
        const [formData, setFormData] = useReducer(formReducer, {});
        const [submitting, setSubmitting] = useState(false);
        let navigate = useNavigate();

        function handleSubmit(event: React.SyntheticEvent) {
            event.preventDefault();

            setSubmitting(true);
            //Don't allow a blank title
            if(formData.value === "") {
                setFormData({name: "title", value: 'empty'});
            }

            //Add the current user as the PI
            const investigator : Investigator = {
                // @ts-ignore
                "@type": "proposal:Investigator",
                "type": "PI",
                "person": user
            };

            const newProposal :ObservingProposal = {
                ...formData,
                "investigators": [investigator]
            };

            fetchProposalResourceCreateObservingProposal({ body: newProposal})
                .then((data) => setSelectedProposal(data?._id))
                .then(()=>setSubmitting(false))
                .then(()=>navigate("/pst/app/proposal/" + selectedProposal))
                .catch(console.log);
        }

        function handleChange(event: React.SyntheticEvent) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div className={""}>
                <h3>Create Proposal</h3>
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <div className={"form-group"}>
                            <label>Title</label>
                            <input className={"form-control"} name="title" onChange={handleChange} />
                        </div>
                        <div className={"form-group"}>
                            <label>Summary</label>
                            <textarea className={"form-control"} rows={3} name="summary" onChange={handleChange} />
                        </div>
                        <div className={"form-group"}>
                            <label>Kind<br/></label>
                            <select className={"form-control"} name="kind" onChange={handleChange}>
                                <option value="">--Please choose an option--</option>
                                <option value="STANDARD">Standard</option>
                         </select>
                        </div>
                        <button className={"btn btn-primary"} type="submit" >Create</button>
                    </fieldset>
                </form>
            </div>
        );
    }

}

export default NewProposalPanel