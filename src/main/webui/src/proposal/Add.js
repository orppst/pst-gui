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
    required: ["title"],
    properties: {
        title: {type: "string", title: "Title", default: "My new proposal"},
        organization_name: {type: "string", title: "Organization Name",
            enum: ["Please choose one"],
            },
        organization_address: {type: "string", title: "Organization Address", default: "ToDo: pre-populate this"},
        person_fullName: {type: "string", title: "PI full name"},
        person_eMail: {type: "string", title: "PI email"},
        source: {type: "array",
          title: "Targets",
          items: {
                properties: {
                "Target": {"$ref": "#/definitions/target"}
                }
            }
          },
          technicalGoal: {type: "object", title:"Technical Goal",
              properties: {
                  performance: {type: "object", title:"Performance",
                      "properties": {
                          "desiredAngularResolution": {
                            "type": "number", title: "Desired Angular Resolution arcsec", default: 25.0
                          },
                          "desiredLargestScale": {
                            "type": "number", title: "Desired Largest Scale degrees", default: 0.1
                          },
                          "spectralWindow": {
                            "type": "array", title: "Spectral Window(s)",
                            items: {
                                properties: { "Window": {"$ref": "#/definitions/spectral_window"} }
                            }
                          }
                      }
                  },
              },
          },
          readyToSubmit: {type: "boolean", title: "Ready to submit?", default: false}
        },
    required: [ "title", "organization_name"]
};

fetch('/proposalSchema')
    .then((data) => {console.log(data);})
    .catch(console.log);
fetch('/organisations')
    .then(res => res.json())
    .then((data) => {
        schema.properties.organization_name.enum = data;
    })
    .catch(console.log);

const log = (type) => console.log.bind(console, type);

export default function AddProposal () {
    return (
        <div className="Prop-form-container chakra-ui-light">
            <Form className="Prop-form"
                schema={schema}
                validator={validator}
                onChange={log("changed")}
                onSubmit={log("submitted")}
                onError={log("errors")} />
        </div>
    );
}
