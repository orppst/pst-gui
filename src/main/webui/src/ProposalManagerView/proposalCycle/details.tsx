import {ReactElement, useEffect, useState} from "react";
import {Group, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {useParams} from "react-router-dom";
import {
    useProposalCyclesResourceGetProposalCycleDetails,
    useProposalCyclesResourceUpdateProposalCycleDetails
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";
import {useQueryClient} from "@tanstack/react-query";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";

export default function CycleDatesPanel() : ReactElement {
    interface updateDatesForm {
        title: string,
        code: string,
        submissionDeadline: Date | null,
        sessionStart: Date | null,
        sessionEnd: Date | null
    }

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

    const {selectedCycleCode} = useParams();
    const [cycleTitle, setCycleTitle] = useState("Loading...")
    const [submitting, setSubmitting] = useState(false);
    const details =
        useProposalCyclesResourceGetProposalCycleDetails(
            {pathParams: {cycleCode: Number(selectedCycleCode)}}
        );

    const form = useForm<updateDatesForm>(
        {
            validateInputOnChange: true,
            initialValues: {
                title: 'Loading...',
                code: 'Loading...',
                submissionDeadline: null,
                sessionStart: null,
                sessionEnd: null
            },

            validate: {
                title: (value : string) => (
                    value.length < 1 ? 'Title cannot be blank' : null),
                code: (value : string) => (
                    value.length < 1 ? 'Code cannot be blank' : null),
                submissionDeadline:
                    value => (value === null ? 'Loading...' : null),
                sessionStart:
                    value => (value === null ? 'Loading...' : null),
                sessionEnd:
                    value => (value === null ? 'Loading...' : null),
            }
        }
    );

    const queryClient = useQueryClient()

    useEffect(() => {
        if (details.status === 'success') {
            setCycleTitle(details.data?.title as string);
            form.values.title = details.data.title as string;
            form.values.code = details.data?.code as string;
            form.values.submissionDeadline = new Date(details.data?.submissionDeadline as string);
            form.values.sessionStart = new Date(details.data?.observationSessionStart as string);
            form.values.sessionEnd = new Date(details.data?.observationSessionEnd as string);
        }
    }, [details.status,details.data]);

    if (details.error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(details.error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const updateCycleDetailsMutation = useProposalCyclesResourceUpdateProposalCycleDetails({
        onMutate: () => {
            setSubmitting(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries()
                .then(()=> setSubmitting(false));
            notifySuccess("Update details", "Update successful");
            setSubmitting(false);
            form.resetDirty();
        },
        onError: (error: unknown) => {
            console.error("An error occurred trying to update the code");
            notifyError("Update failed", getErrorMessage(error));
            setSubmitting(false);
        }
    });

    const handleSave = form.onSubmit(() => {
        updateCycleDetailsMutation.mutate({
            pathParams: {cycleCode: Number(selectedCycleCode)},
            body: {
                title: form.values.title,
                code: form.values.code,
                submissionDeadline: form.values.submissionDeadline?.getTime().toString(),
                observationSessionStart: form.values.sessionStart?.getTime().toString(),
                observationSessionEnd: form.values.sessionEnd?.getTime().toString(),
                observatory: details.data?.observatory
            }
        })
    });

    return (
        <PanelFrame>
            <PanelHeader isLoading={details.isLoading} itemName={cycleTitle} panelHeading={"Dates"}/>

            <form onSubmit={handleSave}>
                <DatesProvider settings={{timezone: 'UTC'}}>
                    <Stack>
                        <TextInput name="title"
                                   label={'Title'}
                                   maxLength={MAX_CHARS_FOR_INPUTS}
                                   {...form.getInputProps('title')}/>
                        <MaxCharsForInputRemaining length={form.values.title.length} />
                        <TextInput name="code"
                                   label={'Unique code'}
                                   maxLength={32}
                                   {...form.getInputProps('code')}/>
                        <Group justify={"center"}>
                            <Text size={"sm"} c={"teal"}> Dates and times are treated as UTC</Text>
                        </Group>
                        <DateTimePicker
                            valueFormat={"YYYY/MM/DD HH:mm"}
                            label={"Submission deadline"}
                            placeholder={"select a proposal submission deadline"}
                            //minDate={new Date()}
                            {...form.getInputProps('submissionDeadline')}
                        />
                        <DateTimePicker
                            valueFormat={"YYYY/MM/DD HH:mm"}
                            label={"Observation session start"}
                            placeholder={"select an observation session start"}
                            minDate={new Date()}
                            {...form.getInputProps('sessionStart')}
                        />
                        <DateTimePicker
                            valueFormat={"YYYY/MM/DD HH:mm"}
                            label={"Observation session end"}
                            placeholder={"select an observation session end"}
                            minDate={new Date()}
                            {...form.getInputProps('sessionEnd')}
                        />
                        <FormSubmitButton form={form} disabled={!submitting && !form.isDirty()}/>
                    </Stack>
                </DatesProvider>

            </form>
        </PanelFrame>
    )
}