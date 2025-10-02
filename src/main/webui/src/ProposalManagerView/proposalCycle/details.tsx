import {ReactElement, useEffect, useState} from "react";
import {Group, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {useParams} from "react-router-dom";
import {
    useProposalCyclesResourceGetProposalCycleDates, 
    useProposalCyclesResourceReplaceCycleDeadline,
    useProposalCyclesResourceReplaceCycleSessionEnd,
    useProposalCyclesResourceReplaceCycleSessionStart, useProposalCyclesResourceReplaceCycleTitle
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES, MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {useQueryClient} from "@tanstack/react-query";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";

export default function CycleDatesPanel() : ReactElement {
    interface updateDatesForm {
        title: string,
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
    const dates =
        useProposalCyclesResourceGetProposalCycleDates(
            {pathParams: {cycleCode: Number(selectedCycleCode)}}
        );

    const {fetcherOptions} = useProposalToolContext();

    const form = useForm<updateDatesForm>(
        {
            validateInputOnChange: true,
            initialValues: {
                title: cycleTitle,
                submissionDeadline: null,
                sessionStart: null,
                sessionEnd: null
            },

            validate: {
                title: (value : string) => (
                    value.length < 1 ? 'Title cannot be blank' : null),
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

    const replaceTitleMutation = useProposalCyclesResourceReplaceCycleTitle({
        onMutate: () => {
            setSubmitting(true);
        },
        onError: (error) => {
            console.error("An error occurred trying to update the title");
            notifyError("Update failed", getErrorMessage(error));
            setSubmitting(false);
        },
        onSuccess: () => {
            queryClient.invalidateQueries()
                .then(()=> setSubmitting(false));
            notifySuccess("Update title", "Update successful");
            form.resetDirty();
        }
    });

    useEffect(() => {
        if (dates.status === 'success') {
            setCycleTitle(dates.data?.title as string);
            form.values.title = dates.data.title as string;
            form.values.submissionDeadline = new Date(dates.data?.submissionDeadline as string);
            form.values.sessionStart = new Date(dates.data?.observationSessionStart as string);
            form.values.sessionEnd = new Date(dates.data?.observationSessionEnd as string);
        }
    }, [dates.status,dates.data]);

    if (dates.error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(dates.error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const replaceDeadlineMutation = useProposalCyclesResourceReplaceCycleDeadline({
        onSuccess: () => {
            notifySuccess("Update dates", "Changes saved");
            form.resetDirty();
        },
        onError: (error) => {
            notifyError("Update session deadline error", getErrorMessage(error));
        }
    });

    const replaceCycleEndMutation = useProposalCyclesResourceReplaceCycleSessionEnd({
        onSuccess: () => {
            replaceDeadlineMutation.mutate({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                body: form.values.submissionDeadline?.getTime().toString()
            });
        },
        onError: (error) => {
            notifyError("Update session end error", getErrorMessage(error));
        }
    });

    const replaceCycleStartMutation = useProposalCyclesResourceReplaceCycleSessionStart({
        onSuccess: () => {
            replaceCycleEndMutation.mutate({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                body: form.values.sessionEnd?.getTime().toString()
            });
        },
        onError: (error) => {
            notifyError("Update session start error", getErrorMessage(error));
        }
    });

    const handleSave = form.onSubmit((val) => {
        replaceCycleStartMutation.mutate({
            pathParams: {cycleCode: Number(selectedCycleCode)},
            body: val.sessionStart?.getTime().toString()
        })
    });

    return (
        <PanelFrame>
            <PanelHeader isLoading={dates.isLoading} itemName={cycleTitle} panelHeading={"Dates"}/>

            <form onSubmit={handleSave}>
                <DatesProvider settings={{timezone: 'UTC'}}>
                    <Stack>
                        <TextInput name="title"
                                   maxLength={MAX_CHARS_FOR_INPUTS}
                                   {...form.getInputProps('title')}/>
                        <MaxCharsForInputRemaining length={form.values.title.length} />
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
                        <FormSubmitButton form={form} />
                    </Stack>
                </DatesProvider>

            </form>
        </PanelFrame>
    )
}