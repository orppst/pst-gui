import React, { useContext, useState } from "react";
import { UserContext } from '../App2'
import { useNavigate } from "react-router-dom";
import {
    fetchInvestigatorResourceRemoveInvestigator,
    useInvestigatorResourceGetInvestigator,
    useInvestigatorResourceGetInvestigators,
} from "../generated/proposalToolComponents";
import {useQueryClient} from "@tanstack/react-query";


function InvestigatorsPanel() {
    const { selectedProposal} = useContext(UserContext);
    const { data , error, isLoading } = useInvestigatorResourceGetInvestigators({pathParams: {proposalCode: selectedProposal},}, {enabled: true});
    let navigate = useNavigate();

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    function handleAddNew(event: React.SyntheticEvent) {
        event.preventDefault();
        navigate("/pst/app/proposal/" + selectedProposal + "/investigators/new");
    }

    return (
        <div>
            <h3>Investigators linked to this proposal</h3>
            <div>
                <button className={"btn btn-primary"} onClick={handleAddNew} >Add New</button>
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
    const { selectedProposal} = useContext(UserContext);
    const [submitting, setSubmitting] = useState(false);
    const tdClass: string = "col-lg-1 col-md-1";
    const { data, error, isLoading } = useInvestigatorResourceGetInvestigator(
        {pathParams:
                    {
                        investigatorId: dbid.dbid,
                        proposalCode: selectedProposal,
                    },
            });
    const queryClient = useQueryClient();

    function handleRemove(event : React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const choice = window.confirm(
            "Are you sure you want to remove the " + data?.type + " " + data?.person?.fullName + "?"
        )
        if(choice) {
            setSubmitting(true);
            fetchInvestigatorResourceRemoveInvestigator({pathParams:
                    {
                        investigatorId: dbid.dbid,
                        proposalCode: selectedProposal,
                    }})
                .then(()=>setSubmitting(false))
                .then(()=>queryClient.invalidateQueries())
                .catch(console.log);
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


export default InvestigatorsPanel