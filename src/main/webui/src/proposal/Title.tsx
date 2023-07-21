import  {  useContext, useState, SyntheticEvent } from "react";
import { ProposalContext} from '../App2'
import {
    fetchProposalResourceReplaceTitle,
    ProposalResourceReplaceTitleVariables,
    useProposalResourceGetObservingProposalTitle,
} from "../generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";

function TitlePanel() {
    const { selectedProposalCode} = useContext(ProposalContext);
    const { data , error, isLoading } = useProposalResourceGetObservingProposalTitle({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});
    const [submitting, setSubmitting] = useState(false);
    const [title, setFormData] = useState("")

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => {
            const newTitle : ProposalResourceReplaceTitleVariables = {//IMPL the code generator does not create the correct type signature for API calls where the body is plain text.
                pathParams: {proposalCode: selectedProposalCode},
                // @ts-ignore
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
            queryClient.invalidateQueries(["pst","api","proposals"])//IMPL this is slightly limiting the invalidation - some things should be ok still (users etc).
                .then(()=> setSubmitting(false))
        },
    })

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    const handleSubmit = (e : SyntheticEvent) => {
        e.preventDefault();
        mutation.mutate();
    }

    function handleChange(event : SyntheticEvent<HTMLInputElement>) {
        setFormData(
             event.currentTarget.value
        );
    }

    return (
        <div>
            <h3>Update title</h3>
            { isLoading ? ("Loading..") :
                 submitting ? ("Submitting..."):
            <form onSubmit={handleSubmit}>
                <div className={"form-group"}>
                            <input className={"form-control"} name="title" defaultValue={`${data}`} onChange={handleChange} />
                            <button type="submit" className={"btn btn-primary"}>Update</button>
                </div>
            </form>
            }
        </div>
    );

}

export default TitlePanel