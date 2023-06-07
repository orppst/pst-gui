import { useContext } from "react";
import { UserContext } from '../App2'
import { useProposalResourceGetObservingProposalTitle } from "../generated/proposalToolComponents.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

function TitlePanel() {
    const {user,selectedProposal} = useContext(UserContext);

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <DisplayTitle />
            </QueryClientProvider>
        </>
    );

    function DisplayTitle() {
        const { data , error, isLoading } = useProposalResourceGetObservingProposalTitle({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div>
                {isLoading ? (`Loading...`)
                    : (`${data}`)}
            </div>
        );
    }

}

export default TitlePanel