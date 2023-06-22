import {React, useContext, useReducer, useState} from "react";
import {AppContextType, UserContext} from "../App2";
import {
    fetchInvestigatorResourceAddPersonAsInvestigator,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "../generated/proposalToolComponents";

function formReducer(state, event : React.SyntheticEvent<HTMLFormElement>) {
    return {
        ...state,
        [event.name]: event.value
    }
}

function AddInvestigatorPanel() {
    return (
        <><AddInvestigatorForm /></>
    )

    function AddInvestigatorForm() {
        const [formData, setFormData] = useReducer(formReducer, {forPhD: false});
        const [query, setQuery] = useState("");
        const { selectedProposal , setNavPanel } = useContext(UserContext) as AppContextType;
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
                    .then(setNavPanel("investigators"))
                    .catch(console.log)
                )
                .catch(console.log);
        }

        function handleCancel(event: React.SyntheticEvent) {
            event.preventDefault();
            setNavPanel("investigators");
        }

        return (
                <div>
                    <h3>Add and remove investigators    </h3>
                    <form>
                        <fieldset>
                        <legend>Type</legend>
                        <select name="type" onChange={handleChange}>
                            <option value="">--Please choose a type--</option>
                            <option value="PI">PI</option>
                            <option value="COI">CO-I</option>
                        </select>
                        </fieldset>
                        <fieldset>
                            <legend>Is this for a PHD?</legend>
                            <div>
                                <input type="checkbox" id="forPhD" name="forPhD" value="true" onChange={handleChange}/>
                                <label htmlFor="forPhD">Yes</label>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Select an investigator</legend>
                            <label>Filter names</label>
                            <input value={query} onChange={(e) => setQuery(e.target.value)}/>
                            <label>Investigators</label>
                            <select name="investigator" onChange={handleChange}>
                                <option value="">--Please choose one--</option>
                            {isLoading ? (
                                <option>Loading…</option>
                            ) :
                                data?.map((item) => (
                                    <option value={item.dbid}>{item.name}</option>
                                )
                            )}
                            </select>
                        </fieldset>
                <button onClick={handleAdd}>Add</button>
                </form>
            <button onClick={handleCancel}>Cancel</button>
            </div>
        )
    }


}

export default AddInvestigatorPanel