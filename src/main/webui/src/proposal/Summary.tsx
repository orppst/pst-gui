import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    fetchProposalResourceReplaceSummary,
    ProposalResourceReplaceSummaryVariables,
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";

function formReducer(state, event : React.SyntheticEvent<HTMLFormElement>) {
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
        const { selectedProposal, setSelectedProposal,setNavPanel } = useContext(UserContext) as AppContextType;
        const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
        const [formData, setFormData] = useReducer(formReducer, {});
        const [submitting, setSubmitting] = useState(false);
        const queryClient = useQueryClient();

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        const handleSubmit = (e) => {
            e.preventDefault();
            mutation.mutate();
        }

        const mutation = useMutation({
                mutationFn: () => {
                    let summary = formData.summary;
                    //Don't allow a blank title
                    if (!summary) {
                        summary = data?.summary;
                    }

                    const newSummary: ProposalResourceReplaceSummaryVariables = {
                        pathParams: {proposalCode: selectedProposal},
                        body: summary,
                        headers: {"Content-Type": "text/plain"}
                    }

                    return fetchProposalResourceReplaceSummary(newSummary);
                },
                onMutate: () => {
                    setSubmitting(true);
                },
                onError: () => {
                    console.log("An error occurred trying to update the title")
                },
                onSuccess: () => {
                    queryClient.invalidateQueries().then(() => setSubmitting(false)).then(setNavPanel('pleaseSelect'));
                }
            }
        );

        function handleChange(event : React.SyntheticEvent<HTMLFormElement>) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div>
                <h3>Update summary</h3>
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <div className={"form-group"}>
                        {isLoading ? (`Loading...`)
                            : submitting? (`Submitting...`) :
                            (
                                <textarea className={"form-control"} rows="3" name="summary" defaultValue={`${data?.summary}`} onChange={handleChange} />
                            )}
                        <button type="submit" className="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
        );
    }

}

export default SummaryPanel