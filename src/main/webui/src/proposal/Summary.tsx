import { useContext, useState, SyntheticEvent } from "react";
import {ProposalContext} from '../App2'
import {
    fetchProposalResourceReplaceSummary,
    ProposalResourceReplaceSummaryVariables,
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";
import {useMutation, useQueryClient} from "@tanstack/react-query";

function SummaryPanel() {
    const { selectedProposalCode} = useContext(ProposalContext) ;
    const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});
    const [summary, setFormData] = useState( "");
    const [submitting, setSubmitting] = useState(false);

    const queryClient = useQueryClient()

    const mutation = useMutation({
            mutationFn: () => {

                const newSummary: ProposalResourceReplaceSummaryVariables = {
                    pathParams: {proposalCode: selectedProposalCode},
                    // @ts-ignore
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
                queryClient.invalidateQueries()
                    .then(() => setSubmitting(false))
            }
        }
    );
    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        mutation.mutate();
    }



    function handleChange(event : SyntheticEvent<HTMLTextAreaElement>) {
        setFormData(
            event.currentTarget.value
        );
    }

    return (
        <div>
            <h3>Update summary</h3>
            {isLoading ? <div>loading...</div>:
              submitting ?
                <div>Submitting request</div> :

            <form onSubmit={handleSubmit}>
                <div className={"form-group"}>
                    <textarea className={"form-control"} rows={3} name="summary" defaultValue={`${data?.summary}`} onChange={handleChange} />
                    <button type="submit" className="btn btn-primary">Update</button>
                </div>
            </form>
            }
        </div>
    );

}

export default SummaryPanel