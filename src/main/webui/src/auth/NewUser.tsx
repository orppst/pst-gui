import {Person} from "../generated/proposalToolSchemas.ts";
import { TextInput, Checkbox, Button, Group, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    fetchPersonResourceCreatePerson,
    fetchSubjectMapResourceCreateFromUser
} from "../generated/proposalToolComponents.ts";
export function NewUser(props: {proposed:Person, uuid:string, userConfirmed:(p:Person)=>void}){

//TODO needs to ask about organisation and create new one if necessary.
    //TODO better error handling.
    interface FormValues {
        fullName : string
        email : string
        termsOfService : boolean

    }
    const form = useForm<FormValues>({
        initialValues: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            fullName : props.proposed.fullName!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            email: props.proposed.eMail!,
            termsOfService: false,
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    function createUser(values:FormValues, id:string)
    {
       //create appropriate entry in the subjectmap.
         fetchPersonResourceCreatePerson({body:{fullName:values.fullName, eMail:values.email}})
             .then(p => {
                 fetchSubjectMapResourceCreateFromUser({body:p,queryParams:{uuid:id}})
                     .then(
                         sm => {
                             console.log("user successfully registered", sm)
                             //tell component above that sucessful
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