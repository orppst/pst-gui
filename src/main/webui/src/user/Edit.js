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
            "eMail": { type: "string", title: "email address", default: "you@example.com" },
            "homeInstitute": {
            type: "object",
            title: "Home institute",
                "properties": {
                    instituteName: { type: "string", title: "Name", default: "none", readOnly: true },
                    instituteAddr: { type: "string", title: "Address", default: "none", readOnly: true },
                }
            }
        }
    };

const uiSchema = { };

var person = {};
const response = fetch(window.location.pathname + '/proposalapi/people/37').then(res=> res.json()).then((data) => {person = data;});

const onSubmit = ({formData}, e) => {
    console.log("Data submitted: ",  formData);

    //Map back into person object
    if(person.fullName != formData.fullName) {
        person.fullName = formData.fullName;
        //Update name
        const requestOptions = { method: 'PUT', body: person.fullName };
        fetch(window.location.pathname + '/proposalapi/people/37/fullName', requestOptions);
    }

    if(person.eMail !=   formData.eMail) {
        person.eMail = formData.eMail;
        //Update email
        const requestOptsEmail = { method: 'PUT', body: person.eMail };
        fetch(window.location.pathname + '/proposalapi/people/37/eMail', requestOptsEmail);
    }

}

export default function EditUser() {

    schema.properties.fullName.default = person.fullName;
    schema.properties.eMail.default = person.eMail;
    schema.properties.homeInstitute.properties.instituteName.default = person.homeInstitute.name;
    schema.properties.homeInstitute.properties.instituteAddr.default = person.homeInstitute.address;

    return (
           <div className="Prop-form-container">
                <Form className="Prop-form"
                     schema={schema}
                     uiSchema={uiSchema}
                     validator={validator}
                     onSubmit={onSubmit}
                     onError={log("errors")} />
           </div>
         )
}