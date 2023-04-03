import React from 'react'
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/core";

const log = (type) => console.log.bind(console, type);

const schema: RJSFSchema = {
        title: "My user details",
        type: "object",
        "properties": {
            "fullName": { type: "string", title: "Full Name", default: "Your name" },
            "eMail": { type: "string", title: "email address", default: "you@example.com" }
        }
    };

var person = {};
const response = fetch(window.location.pathname + '/proposalapi/people/37').then(res=> res.json()).then((data) => {person = data;});

const onSubmit = ({formData}, e) => {
    console.log("Data submitted: ",  formData);
    //Map back into person object
    person.fullName = formData.fullName;
    person.eMail = formData.eMail;
    console.log("New Person Data: ", person);
    //Update name
    const requestOptions = { method: 'PUT', body: person.fullName };
    fetch(window.location.pathname + '/proposalapi/people/37/fullName', requestOptions);
    //Update email
    const requestOptsEmail = { method: 'PUT', body: person.eMail };
    fetch(window.location.pathname + '/proposalapi/people/37/eMail', requestOptsEmail);

}

export default function EditUser() {
/*
    fetch(window.location.pathname + '/proposalapi/people')
        .then(res => res.json())
        .then((data) => {console.log(data);})
        .catch(console.log);

    fetch(window.location.pathname + '/proposalapi/people/37')
        .then(res => res.json())
        .then((data) => {person = data;})
        .catch(console.log);
*/
    schema.properties.fullName.default = person.fullName;
    schema.properties.eMail.default = person.eMail;

    return (
           <div className="Prop-form-container">
                <Form className="Prop-form"
                     schema={schema}
                     validator={validator}
                     onSubmit={onSubmit}
                     onError={log("errors")} />
           </div>
         )
}