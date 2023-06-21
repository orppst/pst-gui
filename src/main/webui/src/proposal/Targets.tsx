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

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div>
                <h3>Add and edit targets</h3>
                <div>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                                return (<RenderTarget prop={selectedProposal} row={item} key={item.dbid}/>)
                            } )
                    }
                </div>
            </div>
        );
    }

    function RenderTarget(proposal :any) {
        const [submitting, setSubmitting] = useState(false);
        const [formData, setFormData] = useReducer(formReducer, {});

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
                <form>
                    <fieldset>
                        {isLoading?
                            (`Loading...`)
                            : (
                                <>
                                <label>Source Name</label>
                                <input title="Name" name="sourceName" value={data?.sourceName} onChange={handleChange} />
                                </>
                            )
                        }
                    </fieldset>
                </form>
            </div>);
    }

}

export default TargetPanel