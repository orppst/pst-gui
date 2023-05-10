import React, {useState, useEffect}  from 'react';
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";
import { findArrayElementByName, uiSchemaCore, schemaCore} from "./Common";

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

export default function EditProposal (nav) {

//An example proposal to edit
const formData = {title: "Sample proposal to edit",
    _id: 0,
    organization_address: "Cheshire",
    organization_name: "Jodrell Bank",
    person_eMail: "pi@does.not.exist",
    person_fullName: "PI",
    source: [ {Target: {targetCoordinates: {lat: 57.009, lon: 48.876}, positionEpoch: "J2013.123", target_sourceName: "Ketchup", coordinateSystem: "J2000"}}],
    technicalGoal: {
        performance: {
            desiredAngularResolution: 21,
            desiredLargestScale: 0.1,
            spectralWindow: [
                {Window: {start: 2.8, end: 3.3, spectral_resolution: 1, polarization: "RR", expected_spectral_line: {expected: "Yes", spectral_line: {start: 3, description: "Hello"}}}}
                ]
            }
        }
    };

    const originalFormData = formData;

    const onSubmit = ({formData}, e) => {
        console.log("Data submitted: ",  formData);
        console.log("Original data : ", originalFormData);
        console.log("Matched back to original observatories list: ", findArrayElementByName(databaseLists.observatories, formData.organization_name));

        const requestOpts = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: {original : originalFormData, new: formData}
        };
        fetch(window.location.pathname + '/proposalapi/proposals/' + originalFormData._id, requestOpts)
            .then( nav('welcome') )
            .catch(log);
    }

    return (
        <div className="Prop-form-container">
        <Form className="Prop-form"
          schema={schema}
          formData={formData}
          uiSchema={uiSchema}
          validator={validator}
          onSubmit={onSubmit}
          onError={log("errors")} />
        </div>
  )};

