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
                    instituteName: { type: "string", title: "Name", default: "none", readOnly: true },
                    instituteAddr: { type: "string", title: "Address", default: "none", readOnly: true },
                }
            }
        }
    };

const uiSchema = { };

var person = {"_id": 46};
const thisUserResponse = fetch(window.location.pathname + '/proposalapi/people/' + person._id)
                        .then(res=> res.json())
                        .then((data) => {person = data;});

const allUsersResponse = fetch(window.location.pathname + '/proposalapi/people/')
            .then(res => res.json())
            .then((data) => {data.map((item) => {
                if(item.name ===  "PI"){
                    person._id = item.dbid;
                    console.log("Found the PI! " + person._id);
                    const thisUserResponse = fetch(window.location.pathname + '/proposalapi/people/' + person._id)
                        .then(res=> res.json())
                        .then((data) => {person = data;});
                    return
                }
            })});

export default function EditUser(nav) {

    const fetchUserData = () => {
        console.log("EditUser useEffect()");
        fetch(window.location.pathname + '/proposalapi/people/' + person._id, { method: 'GET'})
            .then(res => res.json())
            .then(data => {
                person = data;
            })
        console.log("Got new person data... how to refresh?");
        };

    useEffect(() => {
       fetchUserData();
        },[]);

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
        };

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
        Promise.all(promises).then(nav('welcome'));
    }

    console.log("DEBUG a person " + person);
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