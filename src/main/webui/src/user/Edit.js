import React, {useState, useEffect} from 'react';
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
                    name: { type: "string", title: "Name", default: "none", readOnly: true },
                    address: { type: "string", title: "Address", default: "none", readOnly: true },
                }
            }
        }
    };

const uiSchema = { };

var person = {"_id": 46, fullName: "blank", eMail: "none", homeInstitute: {name: "none", address: "nowhere"} };

const fetchUserData = () => {
        fetch(window.location.pathname + '/proposalapi/people/' + person._id, { method: 'GET'})
            .then(res => res.json())
            .then(data => {
                person = data;
            })
        };

const allUsersResponse = fetch(window.location.pathname + '/proposalapi/people/')
            .then(res => res.json())
            .then((data) => {data.map((item) => {
                if(item.name ===  "PI"){
                    person._id = item.dbid;
                    fetchUserData();
                    return
                }
            })});



export default function EditUser(nav) {
    fetchUserData();

    const onSubmit = ({formData}, e) => {
        console.log("Data submitted: ",  formData);

        var promises = [];

        if(person.fullName != formData.fullName) {
            person.fullName = formData.fullName;
            promises.push(fetch(window.location.pathname + '/proposalapi/people/' +  person._id + '/fullName',
                { method: 'PUT', body: person.fullName }));
        }

        if(person.eMail != formData.eMail) {
            person.eMail = formData.eMail;
            promises.push(fetch(window.location.pathname + '/proposalapi/people/' + person._id + '/eMail',
                { method: 'PUT', body: person.eMail }));
        }

/*
        person.fullName = formData.fullName;
        person.eMail = formData.eMail;
        const requestOptsEmail = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: {fullName: person.fullName, eMail: person.eMail}
            };
        fetch(window.location.pathname + '/proposalapi/people/' + person._id + '/nameEMail', requestOptsEmail);

*/
        person = formData;
        Promise.all(promises).then(nav('welcome'));
    }

    return (
           <div className="Prop-form-container">
                <Form className="Prop-form"
                     schema={schema}
                     uiSchema={uiSchema}
                     formData={person}
                     validator={validator}
                     onSubmit={onSubmit}
                     onError={log("errors")} />
           </div>
         )
}