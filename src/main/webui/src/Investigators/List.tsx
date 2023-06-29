import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    fetchInvestigatorResourceRemoveInvestigator,
    useInvestigatorResourceGetInvestigator,
    useInvestigatorResourceGetInvestigators,
} from "../generated/proposalToolComponents";

function InvestigatorsPanel() {

    return (
        <>
            <DisplayInvestigators />
        </>
    );

    function DisplayInvestigators() {
        const { selectedProposal, setNavPanel} = useContext(UserContext) as AppContextType;
        const { data , error, isLoading } = useInvestigatorResourceGetInvestigators({pathParams: {proposalCode: selectedProposal},}, {enabled: true});

        if (error) {
            return (
                <div>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        function handleAddNew(event: React.SyntheticEvent) {
            event.preventDefault();
            setNavPanel("newInvestigator");
        }

        return (
            <div>
                <h3>Investigators linked to this proposal</h3>
                <div>
                    <button className={"btn btn-primary"} onClick={handleAddNew}>Add New</button>
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                            return (<RenderPerson dbid={item?.dbid} key={item?.dbid}/>)
                        } )
                    }
                </div>
            </div>
        );
    }

    function RenderPerson(dbid: any) {
        const { selectedProposal, queryClient} = useContext(UserContext) as AppContextType;
        const [submitting, setSubmitting] = useState(false);
        const tdClass: string = "col-lg-1 col-md-1";
        const { data, error, isLoading } = useInvestigatorResourceGetInvestigator(
            {pathParams:
                        {
                            investigatorId: dbid.dbid,
                            proposalCode: selectedProposal,
                        },
                });

        function handleRemove(event : React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault();
            const choice = window.confirm(
                "Are you sure you want to remove the " + data?.type + " " + data?.person?.fullName + "?"
            )
            if(choice) {
                setSubmitting(true);
                console.log("Remove Investigator with person name of " + data?.person?.fullName);
                fetchInvestigatorResourceRemoveInvestigator({pathParams:
                        {
                            investigatorId: dbid.dbid,
                            proposalCode: selectedProposal,
                        }})
                    .then(setSubmitting(false))
                    .then(()=>queryClient.invalidateQueries())
                    .catch(console.log);
            } else {
                console.log("Do not remove this investigator!");
            }
        }

        return (
            <div>
                {isLoading?(`Loading...`):
                    error?(`Error!`):
                        submitting?(`Removing...`):
                            (
                                <>
                                <table className={"table"}>
                                    <tbody>
                                    <tr className={"row"}><td className={tdClass}>Type</td><td>{data?.type}</td></tr>
                                    <tr className={"row"}><td className={tdClass}>Name</td><td>{data?.person?.fullName}</td></tr>
                                    <tr className={"row"}><td className={tdClass}>Email</td><td>{data?.person?.eMail}</td></tr>
                                    <tr className={"row"}><td className={tdClass}>Institute</td><td>{data?.person?.homeInstitute?.name}</td></tr>
                                    <tr className={"row"}><td className={tdClass}></td><td><button className={"btn btn-danger"} onClick={handleRemove}>Remove</button></td></tr>
                                    </tbody>
                                </table>
                                </>
                            )
                }
            </div>
        );
    }
}


export default InvestigatorsPanel