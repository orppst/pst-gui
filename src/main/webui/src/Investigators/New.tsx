import React, {useContext, useReducer, useState} from "react";
import {AppContextType, UserContext, formReducer} from "../App2";
import {
    fetchInvestigatorResourceAddPersonAsInvestigator,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "../generated/proposalToolComponents";
import {useNavigate} from "react-router-dom";

function AddInvestigatorPanel() {
    return (
        <><AddInvestigatorForm /></>
    )

    function AddInvestigatorForm() {
        const [formData, setFormData] = useReducer(formReducer, {forPhD: false});
        const [query, setQuery] = useState("");
        let navigate = useNavigate();
        const { selectedProposal, queryClient } = useContext(UserContext) as AppContextType;
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

        function handleChange(event : React.SyntheticEvent) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        function handleAdd(event: React.SyntheticEvent) {
            event.preventDefault();
            //Get full investigator from API and add back to proposal
            fetchPersonResourceGetPerson({pathParams:{id: formData.investigator}})
                .then((data) => fetchInvestigatorResourceAddPersonAsInvestigator(
                    {pathParams:{proposalCode: selectedProposal},
                        body:{
                            type: formData.type,
                            forPhD: formData.forPhD,
                            person: data,
                        }})
                    .then(()=>queryClient.invalidateQueries())
                    .then(()=>navigate("/pst/app/proposal/" + selectedProposal + "/investigators"))
                    .catch(console.log)
                )
                .catch(console.log);
        }

        function handleCancel(event: React.SyntheticEvent) {
            event.preventDefault();
            navigate("/pst/app/proposal/" + selectedProposal + "/investigators")
        }

        return (
                <div>
                    <h3>Add and new investigator</h3>
                    <form>
                        <div className={"form-group"}>
                            <label>Type</label>
                            <select className={"form-control"} name="type" onChange={handleChange}>
                                <option value="">--Please choose a type--</option>
                                <option value="PI">PI</option>
                                <option value="COI">CO-I</option>
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
                            <select className={"form-control"} name="investigator" onChange={handleChange}>
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


}

export default AddInvestigatorPanel