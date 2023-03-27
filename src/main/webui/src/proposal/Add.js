import React, {useState, useEffect}  from 'react';
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

const schema: RJSFSchema = {
    title: "Sample Proposal form",
    type: "object",
    "definitions": {
        "target": {
            type: "object",
            properties: {
                target_sourceName: {type:"string", title:"Source Name"},
                sourceCoordinates: {type: "string", title: "Source CoOrdinate System",
                    enum: ["J2000"]},

                sourceLat: {type: "number", title: "Lat", default: 60.0},
                sourceLon: {type: "number", title: "Lon", default: 45.0},
                positionEpoch: {type: "string", title: "Position Epoch", default: "J2013.123"}
            },
            required: ["target_sourceName"]
        },
        "spectral_line": {
            type: "object", title: "Expected Spectral Line",
            properties: {
                start: {type: "number", title: "Frequency GHz", default: 1.4204058},
                description: {type: "string", title: "Description", default: "HI"},
            }
        },
        "spectral_window": {
            type: "object", title: "Spectral Window",
            properties: {
                start: { type: "number", title: "Start GHz", default: "1.2"},
                end: { type: "number", title: "End GHz", default: "1.7"},
                spectral_resolution: { type: "number", title: "Spectral Resolution GHz", default: "0.5"},
                polarization: { type: "string", title: "Polarization", enum: ["LL","RR","LR","RL"], default: "LL"},
                expected_spectral_line: {type: "object", title: "Spectral line", properties: {expected: {type: "string", "enum": ["Yes", "No"], default: "No"}},
                    allOf: [{
                        "if": {"properties": {"expected": {"const": "Yes"}}},
                        "then": {"properties": {"Spectral Line": {"$ref": "#/definitions/spectral_line"}}}}]
                }
            }
        },

    },
    required: [ "title", "organization_name"]
};
const uiSchema = { hidden_person_id: {"ui:widget": "hidden"}};

//FIXME the
fetch(window.location.pathname + '/proposalSchema')
    .then(res => res.json())
    .then((data) => {console.log(data); schema.properties = data;})
    .catch(console.log);
fetch(window.location.pathname + '/proposalapi/observatories')
    .then(res => res.json())
    .then((data) => {
        console.log(data);
        schema.properties.organization_name.enum = data.map(function(x){return x.name});
    })
    .catch(console.log);

const log = (type) => console.log.bind(console, type);

const onSubmit = ({formData}, e) => {
    console.log("Data submitted: ",  formData);
    console.log("Match back to original schema: ", schema.properties);
}

export default function AddProposal () {
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
