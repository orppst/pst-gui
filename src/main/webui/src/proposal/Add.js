import React, {Component} from 'react';

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
    },
    required: ["title"],
    properties: {
        title: {type: "string", title: "Title", default: "My new proposal"},
        organization_name: {type: "string", title: "Organization Name",
            enum: ["Organization name"],
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
              "properties": {
                  "desiredAngularResolution": {
                    "type": "number", title: "Desired Angular Resolution arcsec", default: 25.0
                  },
                  "desiredLargestScale": {
                    "type": "number", title: "Desired Largest Scale degrees", default: 0.1
                  },
              }
          },
          readyToSubmit: {type: "boolean", title: "Ready to submit?", default: false}
        },
    required: [ "title", "organization_name"]
};

schema.properties.organization_name.enum = ["University of Manchester", "Another organisation", "Another organisation2", "Another organisation3"];

const log = (type) => console.log.bind(console, type);

class AddProposal extends Component {

  render() {
    return (
        <div className="Prop-form-container">
        <Form className="Prop-form"
          schema={schema}
          validator={validator}
          onChange={log("changed")}
          onSubmit={log("submitted")}
          onError={log("errors")} />
        </div>
  )};

}

export default AddProposal;