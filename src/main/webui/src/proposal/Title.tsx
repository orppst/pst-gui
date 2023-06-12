import { useReducer, useContext, useState } from "react";
import { UserContext } from '../App2'
import {
    fetchProposalResourceReplaceTitle,
    useProposalResourceGetObservingProposalTitle,
} from "../generated/proposalToolComponents.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

function formReducer(state, event) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function TitlePanel() {

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <DisplayTitle />
            </QueryClientProvider>
        </>
    );

    function DisplayTitle() {
        const { user, selectedProposal } = useContext(UserContext);
        const [formData, setFormData] = useReducer(formReducer, {});
        const [submitting, setSubmitting] = useState(false);
        const { data , error, isLoading } = useProposalResourceGetObservingProposalTitle({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        function handleSubmit(event) {
            event.preventDefault();

            setSubmitting(true);
            //Don't allow a blank title
            if(formData.value === "") {
                setFormData({name: "title", value: data});
            }
            //FIXME: perhaps this should accept application/json as the content type? End up with quotation marks surrounding the new title
            fetchProposalResourceReplaceTitle({pathParams: {proposalCode: selectedProposal}, body: formData.title, headers: {"Content-Type": "text/plain"}})
                .then(setSubmitting(false))
                .catch(console.log);
        }

        function handleChange(event) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div>
                <h3>Update title</h3>
                <form onSubmit={handleSubmit}>
                    <fieldset>
                        <label>
                            <p>Name</p>
                            {isLoading ? (`Loading...`)
                                : (
                                <input name="title" defaultValue={`${data}`} onChange={handleChange} />
                                )}
                            <button type="submit" >Update</button>
                        </label>
                    </fieldset>
                </form>
            </div>
        );
    }

}

export default TitlePanel