import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    fetchProposalResourceReplaceTitle, ProposalResourceReplaceTitleVariables,
    useProposalResourceGetObservingProposalTitle,
} from "../generated/proposalToolComponents";

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
        const { user, selectedProposal, setSelectedProposal,setNavPanel } = useContext(UserContext) as AppContextType;
        const { data , error, isLoading } = useProposalResourceGetObservingProposalTitle({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
        const [formData, setFormData] = useReducer(formReducer, {title: data});
        const [submitting, setSubmitting] = useState(false);

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        function handleSubmit(event : React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault();

            setSubmitting(true);
            //Don't allow a blank title
            if(formData.value === "") {
                setFormData({name: "title", value: data});
            }

            const newTitle : ProposalResourceReplaceTitleVariables = {
                pathParams: {proposalCode: selectedProposal},
                body: formData.title,
                headers: {"Content-Type": "text/plain"}
            }
            //FIXME: perhaps this should accept application/json as the content type? End up with quotation marks surrounding the new title
            fetchProposalResourceReplaceTitle(newTitle)
                .then(setSubmitting(false))
                .then(setSelectedProposal(selectedProposal))
                .then(setNavPanel('summary'))
                .catch(console.log);
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
                    <fieldset>
                        {isLoading ? (`Loading...`)
                            : (
                            <input name="title" defaultValue={`${data}`} onChange={handleChange} />
                            )}
                        <button type="submit" >Update</button>
                    </fieldset>
                </form>
            </div>
        );
    }

}

export default TitlePanel