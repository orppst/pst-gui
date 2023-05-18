import React, {useState, useEffect}  from 'react';
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import {
    JSONToModel,
    ModelToJSON,
    findArrayElementByName,
    uiSchemaCore,
    schemaCore,
    JSONToObservingProposal
} from "./Common";

const schema: RJSFSchema = schemaCore();

const uiSchema = uiSchemaCore();
var databaseLists = {observatories: [{}]};
const log = (type) => console.log.bind(console, type);

//FIXME load these only when required
fetch(window.location.pathname + '/proposalSchema')
    .then(res => res.json())
    .then((data) => {schema.properties = data;})
    .catch(log);

fetch(window.location.pathname + '/proposalapi/observatories')
    .then(res => res.json())
    .then((data) => {
        databaseLists.observatories = data;
        schema.properties.organization_name.enum = data.map(function(x){return x.name});
    })
    .catch(log);

/*
        const dataFetch = async () => {
          const data = await (
            await fetch(
              window.location.pathname + '/proposalapi/observatories'
            )
          ).json();

          // set state when the data received
          schema.properties.organization_name.enum = data.map(function(x){return x.name});
        };
*/


export default function AddProposal (nav) {

    // fetch data
/*    const [isLoading, setIsLoading] = React.useState(false);

    useEffect( () => {
        async function fetchData() {
            setIsLoading(false);
        }
        setIsLoading(true);
        fetchData();

    },[]);
*/
    const onSubmit = ({formData}, e) => {
        //console.log("Data submitted: ",  formData);
        //console.log("Matched back to original observatories list: ", findArrayElementByName(databaseLists.observatories, formData.organization_name));
        const observingProposal = JSONToObservingProposal(formData);
        console.log("This string to be used: " + JSON.stringify(observingProposal));
        fetch(window.location.pathname + '/proposalapi/proposals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(observingProposal) })
            .then(nav('welcome'))
            .catch(log);

        nav('welcome');
    }

    return (
        <div className="Prop-form-container">
        <Form className="Prop-form"
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          onSubmit={onSubmit}
          onError={log("errors")} />
        </div>
  )};
