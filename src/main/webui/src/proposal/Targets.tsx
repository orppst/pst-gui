import { useContext } from "react";
import {ProposalContext} from '../App2'
import {
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents";

function TargetPanel() {
    const { selectedProposalCode} = useContext(ProposalContext);
    const { data , error, isLoading } = useProposalResourceGetTargets({pathParams: {proposalCode: selectedProposalCode},}, {enabled: true});

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
                                return (<RenderTarget prop={selectedProposalCode} row={item} key={item.dbid}/>)
                            } )
                    }
                </div>
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

        function RenderTable(props: any) {
            let tableObj = props.obj;

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
                                <input title="Name" name="sourceName" value={data?.sourceName} />
                                    <RenderTable obj={data}></RenderTable>
                                </>
                            )
                        }
                    </fieldset>
                </form>
            </div>);

}

export default TargetPanel