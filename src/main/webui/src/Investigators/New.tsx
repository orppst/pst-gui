import { useState, SyntheticEvent} from "react";
import {
    fetchInvestigatorResourceAddPersonAsInvestigator,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "../generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind} from "../generated/proposalToolSchemas.ts";
import {Box, Button} from "@mantine/core";

function AddInvestigatorPanel() {
    const [formData, setFormData] = useState( {type: "COI" as InvestigatorKind, forPhD: false, selectedInvestigator: 0});
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const { selectedProposalCode } = useParams();
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
                {pathParams:{proposalCode: Number(selectedProposalCode)},
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
            <Box>
                <h3>Add and new investigator</h3>
                <form>
                    <label>Type</label>
                    <select name="type" onChange={handleChange}>
                        <option value="COI">CO-I</option>
                        <option value="PI">PI</option>
                    </select>
                    <label>Is this for a PHD?</label>
                    <input type="checkbox" id="forPhD" name="forPhD" value="true" onChange={handleChange}/>
                    <label htmlFor="forPhD">Yes</label>
                    <legend>Select an investigator</legend>
                    <label>Filter names</label>
                    <input value={query} onChange={(e) => setQuery(e.target.value)}/>
                    <label>Investigators</label>
                    <select name="selectedInvestigator" onChange={handleChange}>
                        <option value="">--Please choose one--</option>
                        {isLoading ? (
                            <option>Loading…</option>
                        ) :
                            data?.map((item) => (
                                <option key={item.dbid} value={item.dbid}>{item.name}</option>
                            )
                        )}
                    </select>
                    <Button onClick={handleAdd}>Add</Button>
                </form>
                <Button onClick={handleCancel}>Cancel</Button>
            </Box>
    )

}

export default AddInvestigatorPanel