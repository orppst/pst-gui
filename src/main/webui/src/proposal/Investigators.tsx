import React, { useReducer, useContext, useState } from "react";
import {AppContextType, UserContext} from '../App2'
import {
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, Person} from "../generated/proposalToolSchemas";

function formReducer(state, event : React.SyntheticEvent<HTMLFormElement>) {
    return {
        ...state,
        [event.name]: event.value
    }
}
function InvestigatorsPanel() {

    return (
        <>
            <DisplayInvestigators />
        </>
    );

    function DisplayInvestigators() {
        const { selectedProposal} = useContext(UserContext) as AppContextType;
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
                <h3>Add and edit people</h3>
                <div>
                    {isLoading ? (`Loading...`)
                        : data?.investigators?.map((item) => {
                            return (<RenderPerson item={item}/>)
                        } )
                    }
                    <button>Add New</button>
                </div>
            </div>
        );
    }

    function RenderPerson(item: any) {
        const [formData, setFormData] = useReducer(formReducer, {});
        const [submitting, setSubmitting] = useState(false);
        const investigator :Investigator = item.item;
        const person :Person = investigator.person;

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
                    <label>Name</label>
                    <input title="Full Name" name="fullname" value={person?.fullName} onChange={handleChange} />
                    <label>Email</label>
                    <input title="email" name="email" value={person?.eMail} onChange={handleChange} />
                    <label>Institute</label>
                    <input title="institute" name="institute" value={person?.homeInstitute?.name} onChange={handleChange} />
                    <button type="reset" >Remove</button>
                    <button type="submit" >Update</button>
                </fieldset>
            </form>
            </div>
        );
    }
}


export default InvestigatorsPanel