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
                    {isLoading ? (`Loading...`)
                        : data?.map((item) => {
                            return (<RenderPerson dbid={item?.dbid} key={item?.dbid}/>)
                        } )
                    }
                    <button onClick={handleAddNew}>Add New</button>
                </div>
            </div>
        );
    }

    function RenderPerson(dbid: any) {
        const { selectedProposal} = useContext(UserContext) as AppContextType;
        const [submitting, setSubmitting] = useState(false);
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
                    .then(console.log("Deleted, how to refresh this list?"))
                    .catch(console.log);
            } else {
                console.log("Do not remove this investigator!");
            }
        }

        return (
            <div>
            <form>
                <fieldset>
                    {isLoading?(`Loading...`):
                        error?(`Error!`):
                            submitting?(`Removing...`):
                                (
                                    <>
                                    <p><span>Type</span>{data?.type}</p>
                                    <span>Name</span>{data?.person?.fullName}<br />
                                    <span>Email</span>{data?.person?.eMail}<br />
                                    <span>Institute</span>{data?.person?.homeInstitute?.name} <br />
                                    <button onClick={handleRemove}>Remove</button>
                                    </>
                                )
                    }
                </fieldset>
            </form>
            </div>
        );
    }
}


export default InvestigatorsPanel