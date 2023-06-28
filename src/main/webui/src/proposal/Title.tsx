import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    fetchProposalResourceReplaceTitle,
    ProposalResourceReplaceTitleVariables,
    useProposalResourceGetObservingProposalTitle,
} from "../generated/proposalToolComponents";
import {useMutation} from "@tanstack/react-query";

function formReducer(state, event : React.SyntheticEvent<HTMLFormElement>) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function TitlePanel() {

    return (
        <>
            <DisplayTitle />
        </>
    );

    function DisplayTitle() {
        const { selectedProposal, setSelectedProposal,setNavPanel, queryClient } = useContext(UserContext) as AppContextType;
        const { data , error, isLoading } = useProposalResourceGetObservingProposalTitle({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
        const [formData, setFormData] = useReducer(formReducer, {});
        const [submitting, setSubmitting] = useState(false);

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        const mutation = useMutation({
            mutationFn: () => {
                let title = formData.title;
                //Don't allow a blank title
                if(!title) {
                    title = data;
                }

                const newTitle : ProposalResourceReplaceTitleVariables = {
                    pathParams: {proposalCode: selectedProposal},
                    body: title,
                    headers: {"Content-Type": "text/plain"}
                }

                return fetchProposalResourceReplaceTitle(newTitle);
            },
            onMutate: () => {
                setSubmitting(true);
            },
            onError: () => {
                console.log("An error occurred trying to update the title")
            },
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(()=> setSubmitting(false))
            },
        })

        const handleSubmit = (e) => {
            e.preventDefault();
            mutation.mutate();
        }

        function handleChange(event : React.SyntheticEvent<HTMLFormElement>) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div>
                <h3>Update title</h3>
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <div className={"form-group"}>
                        {isLoading ? (`Loading...`)
                            : submitting? (`Submitting...`) :
                            (
                                <input className={"form-control"} name="title" defaultValue={`${data}`} onChange={handleChange} />
                            )}
                        <button type="submit" className={"btn btn-primary"}>Update</button>
                    </div>
                </form>
            </div>
        );
    }

}

export default TitlePanel