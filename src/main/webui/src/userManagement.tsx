import {ReactElement, useContext, useEffect, useState} from "react";
import {ProposalContext} from "./App2.tsx";
import {
    useOrganizationResourceGetOrganization,
    useOrganizationResourceGetOrganizations,
    usePersonResourceUpdateEMail,
    usePersonResourceUpdateFullName,
    usePersonResourceUpdateHomeInstitute,
    usePersonResourceUpdateOrcidId
} from "./generated/proposalToolComponents.ts";
import {PanelFrame, PanelHeader} from "./commonPanel/appearance.tsx";
import {Fieldset, Grid, Group, Loader, Select, Space, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "./commonPanel/notifications.tsx";
import getErrorMessage from "./errorHandling/getErrorMessage.tsx";
import {FormSubmitButton} from "./commonButtons/save.tsx";
import AlertErrorMessage from "./errorHandling/alertErrorMessage.tsx";

function DisplayOrganisationDetails ({organisationId} : {organisationId: number}) : ReactElement {

    const organisation = useOrganizationResourceGetOrganization({
        pathParams: {id: organisationId}
    })

    if (organisation.isLoading) {
        return (<Loader/>)
    }

    if (organisation.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load organisation"}
                error={getErrorMessage(organisation.error)}
            />
        )
    }

    return (
        <Fieldset legend={"Institute Details"}>
            <Text size={"xl"} fw={700}>
                {organisation.data?.name}
            </Text>
            <Space h={"md"}/>
            <Stack gap={"xs"}>
                <Text>
                    <b>Address:</b> {organisation.data?.address}
                </Text>
                <Text>
                    <b>IVO id:</b> {organisation.data?.ivoid?.value}
                </Text>
                <Text>
                    <b>Wiki id:</b> {organisation.data?.wikiId?.value}
                </Text>
            </Stack>
        </Fieldset>
    )
}

export default
function UserManagement() : ReactElement {

    const {user} = useContext(ProposalContext);
    const queryClient = useQueryClient();
    const [selectOrganisation, setSelectOrganisation] = useState<{value: string, label: string}[]>([]);

    const organisations = useOrganizationResourceGetOrganizations({})

    const fullNameMutate = usePersonResourceUpdateFullName();
    const emailMutate = usePersonResourceUpdateEMail();
    const orchidIdMutate = usePersonResourceUpdateOrcidId();
    const homeInstituteMutate = usePersonResourceUpdateHomeInstitute();

    const fullNameForm = useForm<{fullName: string}>({
        initialValues: {fullName: user.fullName!}
    })

    const emailForm = useForm<{email: string}>({
        initialValues: {email: user.eMail!}
    })

    const orchidIdForm = useForm<{orchidId: string}>({
        initialValues: {orchidId: user.orcidId?.value ??  ""}
    })

    const homeInstituteForm = useForm<{homeInstitute: string}>({
        initialValues: {homeInstitute: String(user.homeInstitute?._id!)}
    })

    useEffect(() => {
        if (organisations.status === 'success') {
            setSelectOrganisation(
                organisations.data.map((org) => (
                    {value: String(org.dbid), label: org.name!}
                ))
            )
        }
    }, [organisations]);


    const handleFullNameUpdate = fullNameForm.onSubmit((values) => {
        fullNameMutate.mutate({
            pathParams: {id: user._id!},
            //@ts-ignore
            body: values.fullName
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then()
                notifySuccess("Full name update successful", "Full name changed to " + values.fullName)
            },
            onError: (error) =>
                notifyError("Failed to update full name", getErrorMessage(error))
        })
    })

    const handleEmailUpdate = emailForm.onSubmit((values) => {
        emailMutate.mutate({
            pathParams: {id: user._id!},
            //@ts-ignore
            body: values.email

        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then()
                notifySuccess("Email update successful", "Email changed to " + values.email)
            },
            onError: (error) =>
                notifyError("Failed to update email", getErrorMessage(error))
        })
    })

    const handleOrchidIdUpdate = orchidIdForm.onSubmit((values) => {
        orchidIdMutate.mutate({
            pathParams: {id: user._id!},
            //@ts-ignore
            body: values.orchidId
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then()
                notifySuccess("Orchid ID update successful", "Orchid ID set to " + values.orchidId)
            }
        })
    })

    const handleHomeInstituteUpdate = homeInstituteForm.onSubmit((values) => {
        homeInstituteMutate.mutate({
            pathParams: {id: user._id!},
            body: {
                "_id": Number(values.homeInstitute)
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then()
                notifySuccess("Home Institute update successful",
                    "Home Institute changed to "
                    + selectOrganisation.find((org)=>
                        (org.value === values.homeInstitute))?.label)
            }
        })
    })





    if (organisations.isLoading) {
        return (<Loader/>)
    }

    if (organisations.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to get Organisations"}
                error={getErrorMessage(organisations.error)}
            />
        )
    }

    return (
        <PanelFrame>
            <PanelHeader itemName={"User Settings"} panelHeading={user.fullName}/>
            <Fieldset legend={"User Settings"}>

                <Grid columns={12}>
                    <Grid.Col span={6}>
                        <Stack>
                            <form onSubmit={handleFullNameUpdate}>
                                <Group grow>
                                    <TextInput
                                        label={"Full Name"}
                                        placeholder={"e.g. Jane Doe"}
                                        {...fullNameForm.getInputProps('fullName')}
                                    />
                                    <FormSubmitButton
                                        form={fullNameForm}
                                        label={"Update"}
                                        mt={"1.75em"}
                                        variant={"filled"}
                                    />
                                </Group>
                            </form>
                            <form onSubmit={handleEmailUpdate}>
                                <Group grow>
                                    <TextInput
                                        label={"email"}
                                        placeholder={"e.g. jane.doe@notReal.com"}
                                        {...emailForm.getInputProps('email')}
                                    />
                                    <FormSubmitButton
                                        form={emailForm}
                                        label={"Update"}
                                        mt={"1.75em"}
                                        variant={"filled"}
                                    />
                                </Group>
                            </form>
                            <form onSubmit={handleOrchidIdUpdate}>
                                <Group grow>
                                    <TextInput
                                        label={"ORCID id"}
                                        placeholder={"copy your orchid id here"}
                                        {...orchidIdForm.getInputProps('orchidId')}
                                    />
                                    <FormSubmitButton
                                        form={orchidIdForm}
                                        label={"Update"}
                                        mt={"1.75em"}
                                        variant={"filled"}
                                    />
                                </Group>
                            </form>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Stack>
                            <form onSubmit={handleHomeInstituteUpdate}>
                                <Group grow>
                                    <Select
                                        label={"Home Institute"}
                                        placeholder={"select your primary institute"}
                                        data={selectOrganisation}
                                        {...homeInstituteForm.getInputProps('homeInstitute')}
                                    />
                                    <FormSubmitButton
                                        form={homeInstituteForm}
                                        label={"Update"}
                                        mt={"1.75em"}
                                        variant={"filled"}
                                    />
                                </Group>
                            </form>
                            <DisplayOrganisationDetails
                                organisationId={Number(homeInstituteForm.getValues().homeInstitute)}
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Fieldset>
        </PanelFrame>
    )
}