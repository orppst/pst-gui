import {ReactElement, useContext, useEffect, useState} from "react";
import {ProposalContext} from "./App2.tsx";
import {
    useOrganizationResourceGetOrganization,
    useOrganizationResourceGetOrganizations,
    usePersonResourceUpdateHomeInstitute,
    usePersonResourceUpdateOrcidId,
    useSubjectMapResourceChangeEmailAddress,
    useSubjectMapResourceChangeFirstName,
    useSubjectMapResourceChangeLastName, useSubjectMapResourceGetSubjectMapUid
} from "./generated/proposalToolComponents.ts";
import {PanelFrame, PanelHeader} from "./commonPanel/appearance.tsx";
import {Button, Fieldset, Grid, Group, Loader, Modal, Select, Space, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "./commonPanel/notifications.tsx";
import getErrorMessage from "./errorHandling/getErrorMessage.tsx";
import {FormSubmitButton} from "./commonButtons/save.tsx";
import AlertErrorMessage from "./errorHandling/alertErrorMessage.tsx";
import {useDisclosure} from "@mantine/hooks";
import UserResetPassword from "./userResetPassword.tsx";

interface UserDetailsFormValues {
    firstName: string;
    lastName: string;
    email: string;
}

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

    const [opened, {open, close}] = useDisclosure(false);

    const [selectOrganisation, setSelectOrganisation] = useState<{value: string, label: string}[]>([]);

    const organisations = useOrganizationResourceGetOrganizations({})

    const keycloakId = useSubjectMapResourceGetSubjectMapUid({
        pathParams: {personId: user._id!}
    })

    //keycloak related, i.e., via 'SubjectMap'
    const firstNameMutate = useSubjectMapResourceChangeFirstName();
    const lastNameMutate = useSubjectMapResourceChangeLastName();
    const emailMutate = useSubjectMapResourceChangeEmailAddress();

    //'Person' related
    const orchidIdMutate = usePersonResourceUpdateOrcidId();
    const homeInstituteMutate = usePersonResourceUpdateHomeInstitute();

    const userDetailsForm = useForm<UserDetailsFormValues>({
        initialValues: {
            firstName: user.fullName ?
                user.fullName.substring(0, user.fullName.indexOf(" ")): "",
            lastName: user.fullName ?
                user.fullName.substring(user.fullName.indexOf(" ") + 1) : "",
            email: user.eMail ?? ""
        }
    })

    const orchidIdForm = useForm<{orchidId: string}>({
        initialValues: {orchidId: user.orcidId?.value ??  ""}
    })

    const homeInstituteForm = useForm<{homeInstitute: string}>({
        initialValues: {homeInstitute: user.homeInstitute ? String(user.homeInstitute._id) : ""}
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

    const handleUserDetailsUpdateWithFetch = () => {

        fetch('http://localhost:53536/admin/realms/orppst/users/' + keycloakId.data,
            {
                method: 'PUT',
                body: {
                    // @ts-ignore
                    "firstName": userDetailsForm.getValues().firstName,
                    "lastName": userDetailsForm.getValues().lastName,
                    "email": userDetailsForm.getValues().email
                }
            })
            .then(() => notifySuccess("Update to user details successful", ""))
            .catch((error) => notifyError("Failed to update user details", getErrorMessage(error)))
    }

    const handelUserDetailsUpdate = userDetailsForm.onSubmit((values) => {
        if (userDetailsForm.isDirty('firstName')) {
            firstNameMutate.mutate({
                pathParams: {personId: user._id!},
                body: values.firstName,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("First name update successful",
                        "First name changed to " + values.firstName)
                },
                onError: (error) => {
                    notifyError("Failed to update first name", getErrorMessage(error))
                }
            })
        }

        if (userDetailsForm.isDirty('lastName')) {
            lastNameMutate.mutate({
                pathParams: {personId: user._id!},
                body: values.lastName,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("Last name update successful",
                        "Last name changed to " + values.lastName)
                },
                onError: (error) => {
                    notifyError("Failed to update last name", getErrorMessage(error))
                }
            })
        }

        if (userDetailsForm.isDirty('email')) {
            emailMutate.mutate({
                pathParams: {personId: user._id!},
                body: values.email,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("Email address update successful",
                        "Email address changed to " + values.email)
                },
                onError: (error) => {
                    notifyError("Failed to update email address", getErrorMessage(error))
                }
            })
        }

    })

    const handleOrchidIdUpdate = orchidIdForm.onSubmit((values) => {
        orchidIdMutate.mutate({
            pathParams: {id: user._id!},
            body: values.orchidId,
            //@ts-ignore
            headers: {"Content-Type": "text/plain"}
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then()
                notifySuccess("Orchid ID update successful", "Orchid ID set to " + values.orchidId)
            },
            onError: (error) => {
                notifyError("Failed to update your Orchid ID", getErrorMessage(error))
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
            },
            onError: (error) => {
                notifyError("Failed to update your home institute", getErrorMessage(error))
            }
        })
    })


    if (organisations.isLoading || keycloakId.isLoading) {
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

    if (keycloakId.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to get Keycloak ID"}
                error={getErrorMessage(keycloakId.error)}
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
                            <form onSubmit={handelUserDetailsUpdate}>
                                <TextInput
                                    label={"First Name"}
                                    placeholder={"e.g. Jango"}
                                    {...userDetailsForm.getInputProps('firstName')}
                                />
                                <TextInput
                                    label={"Last Name"}
                                    placeholder={"e.g. Fett"}
                                    {...userDetailsForm.getInputProps('lastName')}
                                />
                                <TextInput
                                    label={"email"}
                                    placeholder={"e.g. jango.fett@tatooine.sw"}
                                    {...userDetailsForm.getInputProps('email')}
                                />
                                <FormSubmitButton
                                    form={userDetailsForm}
                                    label={"Save"}
                                    mt={"1.75em"}
                                    variant={"filled"}
                                />
                            </form>
                            <Button onClick={handleUserDetailsUpdateWithFetch}>
                                Save via fetch
                            </Button>
                            <Button onClick={open}>
                                Reset Password
                            </Button>
                            <Modal
                                opened={opened}
                                onClose={close}
                                title={"Choose a new password"}
                            >
                                <UserResetPassword/>
                            </Modal>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Stack>
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