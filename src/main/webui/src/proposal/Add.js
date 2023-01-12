import React, {Component} from 'react';

import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

const schema: RJSFSchema = {
    title: "Sample Proposal form",
    type: "object",
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
          items: {
            type: "object",
            title: "Source",
            properties: {
              target_sourceName: {type:"string", title:"Source Name"},
              sourceCoordinates: {type: "string", title: "Source CoOrdinate System",
                    enum: ["J2000"]},

              sourceLat: {type: "number", title: "Lat", default: 60.0},
              sourceLon: {type: "number", title: "Lon", default: 45.0},
            }
          },
          readyToSubmit: {type: "boolean", title: "Ready to submit?", default: false}
        },
    required: [ "title", "organization_name", "target_sourceName" ],
    }
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