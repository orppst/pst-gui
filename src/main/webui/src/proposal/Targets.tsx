import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";

function formReducer(state: any, event : React.SyntheticEvent) {
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

        function handleSubmit(event : React.SyntheticEvent) {
            event.preventDefault();

            setSubmitting(true);

            setSubmitting(false);
        }

        function handleChange(event : React.SyntheticEvent) {
            setFormData({
                name: event.target.name,
                value: event.target.value,
            });
        }

        function DrawRow(props: any) {
            const key = props.key;
            const value = props.value;

            console.log(key + " : " + value);

            return (
                <tr><td>GOT SOMETHING!</td></tr>
            )
        }

        function RenderTable(props: any) {
            let obj = props.obj;

            return (
                <div>
                {isLoading?
                    (`Loading...`)
                    : (
                        <table className={"table"}>
                            <tbody>
                            <tr><th>Stuff goes here</th></tr>
                            {Object.entries(obj).forEach(([key, value]) =>
                                (<DrawRow key={key} value={value}/>))
                            }
                            </tbody>
                        </table>
                    )}
                </div>
            )

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
                                    <RenderTable obj={data}></RenderTable>
                                </>
                            )
                        }
                    </fieldset>
                </form>
            </div>);
    }

}

export default TargetPanel