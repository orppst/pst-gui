import {ReactElement, useContext, useEffect, useState} from "react";
import {ProposalContext} from "./App2.tsx";
import {
    fetchSubjectMapResourceChangeEmailAddress,
    fetchSubjectMapResourceChangeFirstName, fetchSubjectMapResourceChangeLastName,
    useOrganizationResourceGetOrganization,
    useOrganizationResourceGetOrganizations,
    usePersonResourceUpdateHomeInstitute,
    usePersonResourceUpdateOrcidId,
    useSubjectMapResourceGetSubjectMapUid
} from "./generated/proposalToolComponents.ts";
import {PanelFrame, PanelHeader} from "./commonPanel/appearance.tsx";
import {
    ActionIcon,
    Box,
    Button, Collapse, Divider,
    Fieldset,
    Grid,
    Group,
    Loader,
    Modal,
    Select,
    Space,
    Stack,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "./commonPanel/notifications.tsx";
import getErrorMessage from "./errorHandling/getErrorMessage.tsx";
import {FormSubmitButton} from "./commonButtons/save.tsx";
import AlertErrorMessage from "./errorHandling/alertErrorMessage.tsx";
import {useDisclosure} from "@mantine/hooks";
import UserResetPassword from "./userResetPassword.tsx";
import UndoButton from "./commonButtons/undo.tsx";
import {CLOSE_DELAY, OPEN_DELAY} from "./constants.tsx";
import {IconEye, IconEyeClosed} from "@tabler/icons-react";

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
            <Box bg={'gray'} p={"sm"}>
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
            </Box>

        </Fieldset>
    )
}

export default
function UserManagement() : ReactElement {

    const {user, getToken} = useContext(ProposalContext);
    const queryClient = useQueryClient();

    const [opened, {open, close}] = useDisclosure(false);

    const [showInstitute, {toggle}] = useDisclosure(false)

    const [selectOrganisation, setSelectOrganisation] = useState<{value: string, label: string}[]>([]);

    const organisations = useOrganizationResourceGetOrganizations({})

    const keycloakId = useSubjectMapResourceGetSubjectMapUid({
        pathParams: {personId: user._id!}
    })

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


    async function handleUserDetailsUpdate(values: typeof userDetailsForm.values) {
        if (userDetailsForm.isDirty('firstName')) {
            await fetchSubjectMapResourceChangeFirstName({
                pathParams: {personId: user._id!},
                body: values.firstName,
                headers: {
                    //authorization: `Bearer ${authToken}`,
                    //@ts-ignore
                    "Content-Type": "text/plain"
                }
            }) .then(() =>
                notifySuccess("First name update successful", "First name changed to " + values.firstName)
            ) .catch(error =>
                notifyError("Failed to update first name", getErrorMessage(error))
            )
        }

        if (userDetailsForm.isDirty('lastName')) {
            await fetchSubjectMapResourceChangeLastName({
                pathParams: {personId: user._id!},
                body: values.lastName,
                headers: {
                    //authorization: `Bearer ${authToken}`,
                    //@ts-ignore
                    "Content-Type": "text/plain"
                }
            }) .then(() =>
                notifySuccess("Last name update successful", "Last name changed to " + values.lastName)
            ) .catch(error =>
                notifyError("Failed to update last name", getErrorMessage(error))
            )
        }

        if (userDetailsForm.isDirty('email')) {
            await fetchSubjectMapResourceChangeEmailAddress({
                pathParams: {personId: user._id!},
                body: values.email,
                headers: {
                    //authorization: `Bearer ${authToken}`,
                    //@ts-ignore
                    "Content-Type": "text/plain"
                }
            }) .then(() =>
                notifySuccess("Email address update successful",
                    "Email address changed to " + values.email)
            ) .catch(error =>
                notifyError("Failed to update email address", getErrorMessage(error))
            )
        }

        userDetailsForm.resetDirty();

        user.fullName = values.firstName + " " + values.lastName;
    }

    const handleOrchidIdUpdate = orchidIdForm.onSubmit((values) => {
        orchidIdMutate.mutate({
            pathParams: {id: user._id!},
            body: values.orchidId,
            headers: {
                authorization: 'Bearer ' + getToken(),
                //@ts-ignore
                "Content-Type": "text/plain"
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(()=> {
                        notifySuccess("Orchid ID update successful",
                            "Orchid ID set to " + values.orchidId);
                        orchidIdForm.resetDirty();//disables the buttons after a successful update
                    }
                )
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
                "@type": "proposal:Organization",
                "_id": Number(values.homeInstitute)
            },
            headers: {
                authorization: 'Bearer ' + getToken()
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
            <Grid columns={12}>
                <Grid.Col span={5}>
                    <Fieldset legend={"Personal Details"}>
                        <form onSubmit={userDetailsForm.onSubmit(handleUserDetailsUpdate)}>
                            <Stack>
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
                            </Stack>
                            <Group justify={'flex-end'}>
                                <FormSubmitButton
                                    form={userDetailsForm}
                                    label={"Save"}
                                    variant={"filled"}
                                    mt={"lg"}
                                />
                                <UndoButton
                                    form={userDetailsForm}
                                    mt={"lg"}
                                />
                            </Group>
                        </form>
                        <Divider my={"lg"}/>
                        <Group justify={'center'}>
                            <Tooltip
                                label={"Opens a modal"}
                                openDelay={OPEN_DELAY}
                                closeDelay={CLOSE_DELAY}
                            >
                                <Button onClick={open} color={'pink'}>
                                    Reset Password
                                </Button>
                            </Tooltip>
                        </Group>
                        <Modal
                            opened={opened}
                            onClose={close}
                            title={"Choose a new password"}
                            closeOnClickOutside={false}
                        >
                            <UserResetPassword/>
                        </Modal>
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={7}>
                    <Fieldset legend={"Home Organization"}>
                        <Stack>
                            <form onSubmit={handleHomeInstituteUpdate}>
                                <Grid columns={10}>
                                    <Grid.Col span={9}>
                                        <Select
                                            label={"Institute"}
                                            placeholder={"select your primary institute"}
                                            data={selectOrganisation}
                                            {...homeInstituteForm.getInputProps('homeInstitute')}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={1}>
                                        <Tooltip
                                            label={showInstitute ? "Close institute details" : "Show institute details"}
                                            openDelay={OPEN_DELAY}
                                            closeDelay={CLOSE_DELAY}
                                        >
                                            <ActionIcon
                                                onClick={toggle}
                                                mt={"1.75em"}
                                            >
                                                {showInstitute ? <IconEyeClosed /> : <IconEye />}
                                            </ActionIcon>
                                        </Tooltip>
                                    </Grid.Col>
                                </Grid>
                                <Collapse in={showInstitute}>
                                    <DisplayOrganisationDetails
                                        organisationId={Number(homeInstituteForm.getValues().homeInstitute)}
                                    />
                                </Collapse>
                                <Group justify={"flex-end"}>
                                    <FormSubmitButton
                                        form={homeInstituteForm}
                                        label={"Save"}
                                        mt={"lg"}
                                        variant={"filled"}
                                    />
                                    <UndoButton form={homeInstituteForm} mt={"lg"}/>
                                </Group>
                            </form>
                        </Stack>
                    </Fieldset>
                    <Space h={"xs"}/>
                    <Fieldset legend={"ORCID"}>
                        <form onSubmit={handleOrchidIdUpdate}>
                            <TextInput
                                label={"Orchid id"}
                                placeholder={"copy your orchid id here"}
                                {...orchidIdForm.getInputProps('orchidId')}
                            />
                            <Group justify={"flex-end"}>
                                <FormSubmitButton
                                    form={orchidIdForm}
                                    label={"Save"}
                                    mt={"lg"}
                                    variant={"filled"}
                                />
                                <UndoButton
                                    form={orchidIdForm}
                                    mt={"lg"}
                                />
                            </Group>
                        </form>
                    </Fieldset>
                </Grid.Col>
            </Grid>
        </PanelFrame>
    )
}