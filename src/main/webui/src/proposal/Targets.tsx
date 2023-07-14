import React, { useReducer, useContext, useState } from "react";
import { UserContext, formReducer} from '../App2'
import {
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";

function TargetPanel() {
    const { selectedProposal} = useContext(UserContext);
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

        function RenderTable(props: any) {
            let tableObj = props.obj;

            //console.log("RenderTable passed this tabelObj: " + JSON.stringify(tableObj, null, 2));

            if(tableObj === undefined || tableObj === null) {
                return (<table><tbody><tr><td>null</td></tr></tbody></table>);
            }

            return (
                <div>
                {isLoading?
                    (`Loading...`)
                    : (
                        <table className={"table"}>
                            <tbody>
                                {Object.keys(tableObj).map((key) => (
                                    (typeof tableObj[key] === 'object')?
                                    (<tr key={key}><td>{key}</td><td><RenderTable obj={tableObj[key]} /></td></tr>)
                                    :
                                    (<tr key={key}><td>{key}</td><td>{tableObj[key]}</td></tr>))

                                )}
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

export default TargetPanel