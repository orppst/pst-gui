import {ObjectIdentifier, Person} from "../generated/proposalToolSchemas.ts";
import {TextInput, Checkbox, Button, Group, Box, Select, Text, Modal, Space} from '@mantine/core';
import {useForm} from '@mantine/form';
import {
    fetchOrganizationResourceGetOrganizations,
    fetchPersonResourceCreatePerson,
    fetchSubjectMapResourceCreateFromUser
} from "../generated/proposalToolComponents.ts";
import AddButton from "../commonButtons/add.tsx";
import {useDisclosure} from "@mantine/hooks";
import NewOrganization from "./NewOrganization.tsx";
import {useEffect, useState} from "react";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";

export function NewUser(props: {proposed:Person, uuid:string, userConfirmed:(p:Person)=>void}){

    interface FormValues {
        fullName : string
        email : string
        termsOfService : boolean
        organizationId: number | undefined
    }

    const [organizationsData, setOrganizationsData]
        = useState<{value: string, label: string}[]>([]);


    //use this to trigger a re-fetch of organisations on "New Organization" modal close
    const [count, setCount] = useState(0);

    useEffect( () => {
        //grab the list of known organizations
        fetchOrganizationResourceGetOrganizations({})
            .then((data: ObjectIdentifier[]) => {
                setOrganizationsData(
                    data?.map((org) => (
                        {value: String(org.dbid), label: org.name!}
                    ))
                );
            })
            .catch((error) => {
                notifications.show({
                    autoClose: false,
                    title: "Loading Organizations failed",
                    message: "Cannot load Organizations, caused by " + getErrorMessage(error)
                });
            })
    }, [count])

    useEffect(() => {
        if (count > 0)
            notifications.show({
                autoClose: false,
                message: "New Organization added",
                color: "green"
            })
    }, [organizationsData.length]);


    const [opened, {close, open}] = useDisclosure();


    const form = useForm<FormValues>({
        initialValues: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            fullName : props.proposed.fullName!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            email: props.proposed.eMail!,
            termsOfService: false,
            organizationId: undefined
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            termsOfService: (value) => value ?
                null : 'Please agree to the terms-of-service',
            organizationId: (value) =>
                value === undefined ? 'Please select an Organization': null
        },
    });

    function createUser(values:FormValues, id:string)
    {
        let newUser : Person = {
            fullName: values.fullName,
            eMail: values.email,
            homeInstitute: {
                "@type": "proposal:Organization",
                _id: values.organizationId
            }
        }
       //create appropriate entry in the subjectmap.
         fetchPersonResourceCreatePerson({body: newUser})
             .then(p => {
                 fetchSubjectMapResourceCreateFromUser({body: p, queryParams: {uuid:id}})
                     .then(
                         sm => {
                             console.log("user successfully registered", sm)
                             //tell component above that successful
                             props.userConfirmed(p)

                         }
                     )
             }).catch(console.error)
    }


    return (
        <Box maw={450} mx="auto">
            <h1>Confirm details to be entered into Polaris</h1>
            <form onSubmit={form.onSubmit((values) => createUser(values,props.uuid))}>
                <TextInput
                    withAsterisk
                    label="Full Name"
                    placeholder="your name"
                    {...form.getInputProps('fullName')}
                />
                <TextInput
                    withAsterisk
                    label="Email"
                    placeholder="your@email.com"
                    {...form.getInputProps('email')}
                />
                <Select
                    label={"Home Institute"}
                    placeholder={"pick one"}
                    data={organizationsData}
                    {...form.getInputProps('organizationId')}
                />

                <Checkbox
                    mt="md"
                    label="I agree to the terms"
                    {...form.getInputProps('termsOfService', { type: 'checkbox' })}
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>

            </form>

            <Space h={"sm"}/>
            <Group justify={"center"} gap={"xs"}>
                <Text size={"sm"} c={"teal"}>
                    If your organization is not listed please
                </Text>
                <AddButton
                    toolTipLabel={"opens New Organization modal"}
                    label={"add it"}
                    onClick={open}
                />
            </Group>
            <Modal
                opened={opened}
                onClose={close}
                title={"Add New Organization"}
                size={"30%"}
            >
                {
                    NewOrganization(() => {
                        close();
                        setCount(count + 1); // triggers a re-fetch of organisations
                    })
                }
            </Modal>
        </Box>
    )
}