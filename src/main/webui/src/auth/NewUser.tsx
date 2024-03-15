import {Person} from "../generated/proposalToolSchemas.ts";
import {TextInput, Checkbox, Button, Group, Box, Select} from '@mantine/core';
import {useForm} from '@mantine/form';
import {
    fetchPersonResourceCreatePerson,
    fetchSubjectMapResourceCreateFromUser, useOrganizationResourceGetOrganizations
} from "../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../constants.tsx";

//TODO create new organisation if necessary.
//TODO better error handling.

export function NewUser(props: {proposed:Person, uuid:string, userConfirmed:(p:Person)=>void}){

    //grab the list of known organizations
    const {
        data: organizations,
        error: organizationsError,
        isLoading: organizationsIsLoading
    } = useOrganizationResourceGetOrganizations({});

    if (organizationsError) {
        return (
            <Box>
                <pre>{JSON.stringify(organizationsError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    interface FormValues {
        fullName : string
        email : string
        termsOfService : boolean
        organizationId: number
    }

    let organizationsData : {value: string, label: string}[] = []
    if (!organizationsIsLoading) {
        organizationsData
            = organizations!.map((org) =>{
            return {value: String(org.dbid!), label: org.name!}
        })
    }

    const form = useForm<FormValues>({
        initialValues: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            fullName : props.proposed.fullName!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            email: props.proposed.eMail!,
            termsOfService: false,
            organizationId: 0
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            termsOfService: (value) => value ?
                null : 'Please agree to the terms-of-service (I\'m pretty certain we removed the clause about selling your soul)'
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
        <Box maw={340} mx="auto">
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
        </Box>
    )
}