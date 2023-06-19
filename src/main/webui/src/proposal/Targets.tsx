import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";

function formReducer(state, event : React.SyntheticEvent<HTMLFormElement>) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function TargetPanel() {

    return (
        <>
            <DisplayTargets />
        </>
    );

    function DisplayTargets() {
        const { selectedProposal} = useContext(UserContext) as AppContextType;
        const { data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
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

            setSubmitting(false);
        }

        function handleChange(event : React.SyntheticEvent<HTMLFormElement>) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        return (
            <div>
                <h3>Add and edit targets</h3>
                {submitting &&
                    <div>Submitting request</div>
                }
                <form onSubmit={handleSubmit}>
                    <div>
                        {isLoading ? (`Loading...`)
                            : data.map((item) => {
                                    return (<li key={item.dbid}><RenderTarget prop={selectedProposal} row={item}/></li>)
                                } )
                        }
                    </div>
                </form>
            </div>
        );
    }

    function RenderTarget(proposal :any) {
        const {data, error, isLoading} = useProposalResourceGetTarget(
            {pathParams:
                    {
                        proposalCode: proposal.prop,
                        targetId: proposal.row.dbid,
                    },
            });
        if(error) {
            return <div>Error loading target</div>
        }
        return (<div>{isLoading? (`Loading...`): JSON.stringify(data)}</div>);
    }

}

export default TargetPanel