import {ReactElement} from "react";
import {Button, Container, Group, TextInput} from "@mantine/core";
import {Organization} from "../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {fetchOrganizationResourceCreateOrganization} from "../generated/proposalToolComponents.ts";
import {notifications} from "@mantine/notifications";


interface organizationValues {
    organization: Organization
}


export default function NewOrganization(closeModal: () => void) : ReactElement {

    const form = useForm<organizationValues>( {
        initialValues: {
            organization: {
                "@type": "proposal:Organization",
                name: "",
                address: "",
                ivoid: {value: ""},
                wikiId: {value: ""}
            }
        },
        validate: {
            organization: {
                name: (value) => (
                    value === "" ? 'Please supply an Organization name' : null
                ),
                address: (value) => (
                    value === "" ? 'Please supply an Organization address' : null
                )
            }
        }
    });


    const handleSubmit = form.onSubmit((values) =>{
        fetchOrganizationResourceCreateOrganization({
            body: values.organization
        })
            .then(closeModal)
            .catch((reason) => {
                notifications.show({
                    autoClose: false,
                    title: "Organization add failed",
                    message: values.organization.name + " has not been added. Error: " + reason,
                    color: "red"
                })
            })
    })

    return (
        <Container fluid>
            <form onSubmit={handleSubmit}>
                <TextInput
                    withAsterisk
                    label={"Organization name"}
                    {...form.getInputProps("organization.name")}
                />
                <TextInput
                    withAsterisk
                    label={"Organization address"}
                    {...form.getInputProps("organization.address")}
                />
                <TextInput
                    label={"IVO id"}
                    {...form.getInputProps("organization.ivoid.value")}
                />
                <TextInput
                    label={"Wiki id"}
                    {...form.getInputProps("organization.wikiId.value")}
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit" color={"green"}>Add</Button>
                </Group>
            </form>
        </Container>
    )
}