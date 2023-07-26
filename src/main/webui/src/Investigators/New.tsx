import {useContext,  useState, SyntheticEvent} from "react";
import {ProposalContext} from "../App2";
import {
    fetchInvestigatorResourceAddPersonAsInvestigator,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "../generated/proposalToolComponents";
import {useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind} from "../generated/proposalToolSchemas.ts";

function AddInvestigatorPanel() {
    const [formData, setFormData] = useState( {type: "COI" as InvestigatorKind, forPhD: false, selectedInvestigator: 0});
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const { selectedProposalCode} = useContext(ProposalContext);
    const queryClient = useQueryClient();
    const { data, error, isLoading } = usePersonResourceGetPeople(
        {
            queryParams: { name: '%' + query + '%'},
        },
        {
            enabled: true,
        }
    );

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    function handleChange(event : SyntheticEvent<HTMLInputElement|HTMLSelectElement>) {
        setFormData({
            ...formData,
            [event.currentTarget.name] : event.currentTarget.value
        });
    }

    function handleAdd(event: SyntheticEvent) {
        event.preventDefault();
        //Get full investigator from API and add back to proposal
        fetchPersonResourceGetPerson({pathParams:{id: formData.selectedInvestigator}})
            .then((data) => fetchInvestigatorResourceAddPersonAsInvestigator(
                {pathParams:{proposalCode: selectedProposalCode},
                    body:{
                        type: formData.type,
                        forPhD: formData.forPhD,
                        person: data,
                    }})
                .then(()=> {
                    return queryClient.invalidateQueries();
                })
                .then(()=>navigate(  "../", {relative:"path"})) // see https://stackoverflow.com/questions/72537159/react-router-v6-and-relative-links-from-page-within-route
                .catch(console.log)
            )
            .catch(console.log);
    }

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
            <div>
                <h3>Add and new investigator</h3>
                <form>
                    <div className={"form-group"}>
                        <label>Type</label>
                        <select className={"form-control"} name="type" onChange={handleChange}>
                            <option value="COI">CO-I</option>
                            <option value="PI">PI</option>
                        </select>
                    </div>
                    <div className={"form-group"}>
                        <label>Is this for a PHD?</label>
                        <input className={"form-control"} type="checkbox" id="forPhD" name="forPhD" value="true" onChange={handleChange}/>
                        <label htmlFor="forPhD">Yes</label>
                    </div>
                    <div className={"form-group"}>
                        <legend>Select an investigator</legend>
                        <label>Filter names</label>
                        <input className={"form-control"} value={query} onChange={(e) => setQuery(e.target.value)}/>
                        <label>Investigators</label>
                        <select className={"form-control"} name="selectedInvestigator" onChange={handleChange}>
                            <option value="">--Please choose one--</option>
                            {isLoading ? (
                                <option>Loading…</option>
                            ) :
                                data?.map((item) => (
                                    <option key={item.dbid} value={item.dbid}>{item.name}</option>
                                )
                            )}
                        </select>
                    </div>
                    <button className={"btn btn-primary"} onClick={handleAdd}>Add</button>
                </form>
                <button className={"btn"} onClick={handleCancel}>Cancel</button>
            </div>
    )

}

export default AddInvestigatorPanel