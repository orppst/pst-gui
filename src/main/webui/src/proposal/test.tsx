import { useContext } from "react";
import { UserContext } from '../App2'
import { useProposalResourceGetObservingProposal } from "../generated/proposalToolComponents.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient()

function TestPanel() {
    const {user,selectedProposal} = useContext(UserContext);


    return (
        <>
            <QueryClientProvider client={queryClient}>
            <DisplayProp />
            </QueryClientProvider>
        </>
    );

    function DisplayProp() {
        if(selectedProposal === 0) {
            return (<div>Please select a proposal from the list</div>);
        }

        const { data , error, isLoading } = useProposalResourceGetObservingProposal({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
                <div>
                    {isLoading? (`You are ${user} with selected proposal ${selectedProposal}`)
                        : (JSON.stringify(data))}
                </div>
        );
    }

}

export default TestPanel