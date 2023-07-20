import { useContext, useState} from "react";
import {ProposalContext} from '../App2'
import {
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, ObservingProposal} from "../generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";

function NewProposalPanel() {
    const { user, selectedProposalCode, selectedProposal } = useContext(ProposalContext) ;
    const [formData, setFormData] = useContext( {title:"Empty", summary:"Empty", kind:"STANDARD"});
    const [submitting, setSubmitting] = useState(false);
    let navigate = useNavigate();
    const kindOptions = ["Standard", "TOO", "Survey"];

    function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();

        setSubmitting(true);

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
            .then((data) => {
                setSelectedProposal(data?._id);
                setSubmitting(false);
                navigate("/pst/app/proposal/" + selectedProposal);
            })
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
                        { kindOptions.map((opt)=>(<option value={opt.toUpperCase()}>{opt}</option>)) }
                 </select>
                </div>
                <button className={"btn btn-primary"} type="submit" >Create</button>
            </form>
        </div>
    );
}

export default NewProposalPanel