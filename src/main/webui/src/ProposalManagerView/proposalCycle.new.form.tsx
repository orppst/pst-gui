import {ReactElement, useEffect, useState} from "react";
import {FormSubmitButton} from "../commonButtons/save.tsx";
import {useForm} from "@mantine/form";
import {ProposalCycle} from "../generated/proposalToolSchemas.ts";
import {Group, Select, Stack, Text, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {
    useObservatoryResourceGetObservatories,
    useProposalCyclesResourceCreateProposalCycle
} from "../generated/proposalToolComponents.ts";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import {notifyError, notifySuccess} from "../commonPanel/notifications.tsx";
import {useQueryClient} from "@tanstack/react-query";

interface NewCycleFormProps {
    closeModal?: () => void
}

export default function NewCycleForm({closeModal}: NewCycleFormProps): ReactElement {

    interface NewCycleFormType {
        title: string,
        submissionDeadline: Date | null,
        sessionStart: Date | null,
        sessionEnd: Date | null,
        observatoryId: number | undefined
    }
    const queryClient = useQueryClient();

    const [observatories, setObservatories]
        = useState<{ value: string, label: string }[]>([]);

    const {data, status, error} = useObservatoryResourceGetObservatories({});

    const createProposalCycleMutation = useProposalCyclesResourceCreateProposalCycle({
        onSuccess: (newCycle) => {
            queryClient.invalidateQueries()
                .then(() => notifySuccess("Success", "Proposal Cycle " + newCycle.title + " created"))
        },
        onError: (error) => {
            if(error != undefined) {
                console.error(error.payload);
                notifyError("Create cycle error", error.payload);
            } else
                notifyError("Create cycle error", "An unknown error occurred.");
        }
    });

    useEffect(() => {
        if(error)
            notifyError("Loading Observatories failed", "Cannot load Observatories, caused by " + getErrorMessage(error));
        else {
              if(data != undefined)
                  setObservatories(
                    data?.map((obs) => (
                        {value: String(obs.dbid), label: obs.name!}
                    ))
                );
        }
    }, [data, status]);


    const form = useForm<NewCycleFormType>(
        {
            validateInputOnChange: true,
            initialValues: {
                title: "",
                submissionDeadline: null,
                sessionStart: null,
                sessionEnd: null,
                observatoryId: undefined
            },

            validate: {
                title:
                    value => (value.length < 3 ? 'Title must have at least 3 characters' : null),
                submissionDeadline:
                    value => (value === null ? 'Please select a submission deadline date' : null),
                sessionStart:
                    value => (value === null ? 'Please select an observation session start date' : null),
                sessionEnd:
                    value => (value === null ? 'Please select an observation session end date' : null),
                observatoryId:
                    value => (value === undefined ? 'Please select an observatory' : null)
            }
        }
    );

    function createCycle(values: NewCycleFormType) {
        //ts-ignores required as API expects dates as a number (milliseconds since posix epoch),
        //not an ISO string which is the given type for dates in ProposalCycle.

        const newCycle: ProposalCycle = {
            title: values.title,
            observatory: {
                "@type": "proposalManagement:Observatory",
                _id: values.observatoryId!
            },
            tac: {
                members: []
            },
            availableResources: {
                resources: []
            },
            submissionDeadline: values.submissionDeadline!.getTime().toString(),
            observationSessionStart: values.sessionStart!.getTime().toString(),
            observationSessionEnd: values.sessionEnd!.getTime().toString(),
        }

        createProposalCycleMutation.mutate({body: newCycle});

        closeModal && closeModal();
    }

    return (
        <form onSubmit={form.onSubmit((values) => createCycle(values))}>
            <DatesProvider settings={{timezone: 'UTC'}}>
                <Stack>
                    <Text size={"md"} c={"gray.6"}>Please complete all fields</Text>
                    <TextInput
                        name={"title"}
                        label={"Title"}
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        description={
                            MAX_CHARS_FOR_INPUTS -
                            form.values.title.length +
                            "/" + String(MAX_CHARS_FOR_INPUTS)}
                        inputWrapperOrder={[
                            'label', 'error', 'input', 'description']}
                        placeholder={"Give the proposal cycle a title"}
                        {...form.getInputProps('title')}
                    />
                    <Select
                        label={"Observatory"}
                        placeholder={"pick one"}
                        data={observatories}
                        {...form.getInputProps('observatoryId')}
                    />
                    <Group justify={"center"}>
                        <Text size={"sm"} c={"teal"}> Dates and times are treated as UTC</Text>
                    </Group>
                    <DateTimePicker
                        valueFormat={"YYYY/MM/DD HH:mm"}
                        label={"Submission deadline"}
                        placeholder={"select a proposal submission deadline"}
                        minDate={new Date()}
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
                    <FormSubmitButton
                        label={"Create Proposal Cycle"}
                        form={form}
                    />
                </Stack>
            </DatesProvider>
        </form>
    )
}