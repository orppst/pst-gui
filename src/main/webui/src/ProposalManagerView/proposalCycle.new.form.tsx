import {ReactElement, useEffect, useRef, useState} from "react";
import {FormSubmitButton} from "../commonButtons/save.tsx";
import {useForm} from "@mantine/form";
import {ProposalCycle} from "../generated/proposalToolSchemas.ts";
import {Group, Loader, Select, Stack, Text, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {
    useObservatoryResourceGetObservatories,
    useObservingModeResourceCopyObservingModes,
    useProposalCyclesResourceCreateProposalCycle,
    useProposalCyclesResourceGetProposalCycles,
    useResourceTypeResourceGetAllResourceTypes,
} from "../generated/proposalToolComponents.ts";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";
import {notifyError, notifySuccess} from "../commonPanel/notifications.tsx";
import {useQueryClient} from "@tanstack/react-query";
import AlertErrorMessage from "../errorHandling/alertErrorMessage.tsx";

interface NewCycleFormProps {
    closeModal?: () => void
}

export default function NewCycleForm({closeModal}: NewCycleFormProps): ReactElement {

    interface NewCycleFormType {
        title: string,
        cycleCode: string,
        submissionDeadline: Date | null,
        sessionStart: Date | null,
        sessionEnd: Date | null,
        observatoryId: number | null,
        sourceCycleId: string | null
    }
    const queryClient = useQueryClient();

    const [observatories, setObservatories]
        = useState<{ value: string, label: string }[]>([]);

    const [availableCycles, setAvailableCycles]
        = useState<{ value: string, label: string }[]>([]);

    const sourceCycleIdRef = useRef<string | null>(null);

    const {data, status, error} = useObservatoryResourceGetObservatories({queryParams: {}});

    //hard coded name "observing time" used
    const observingTimeResourceType =
        useResourceTypeResourceGetAllResourceTypes({
            queryParams: {resourceTypeName: "%observing time%"}
        })

    const form = useForm<NewCycleFormType>(
        {
            validateInputOnChange: true,
            initialValues: {
                title: "",
                cycleCode: "",
                submissionDeadline: null,
                sessionStart: null,
                sessionEnd: null,
                observatoryId: null,
                sourceCycleId: null
            },

            validate: {
                title:
                    value => (value.length < 3 ? 'Title must have at least 3 characters' : null),
                cycleCode:
                    value => (value.length < 3 ? 'Cycle code cannot be empty' : null),
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

    const selectedObservatoryId = form.values.observatoryId;

    const cyclesData = useProposalCyclesResourceGetProposalCycles(
        {
            queryParams: {
                includeClosed: true,
                ...(selectedObservatoryId ? {observatoryId: +selectedObservatoryId} : {})
            }
        },
        {enabled: selectedObservatoryId != null}
    );

    const copyObservingModesMutation = useObservingModeResourceCopyObservingModes({
        onSuccess: () => {
            notifySuccess("Success", "Observing modes copied successfully");
        },
        onError: (error) => {
            if(error != undefined) {
                console.error(error.payload);
                notifyError("Copy observing modes error", error.payload);
            } else
                notifyError("Copy observing modes error", "An unknown error occurred.");
        }
    });

    const createProposalCycleMutation = useProposalCyclesResourceCreateProposalCycle({
        onSuccess: (newCycle) => {
            queryClient.invalidateQueries()
                .then(() => notifySuccess("Success", "Proposal Cycle \"" + newCycle.title + "\" created"));

            const sourceCycleId = sourceCycleIdRef.current;
            if (sourceCycleId != null && newCycle._id != undefined) {
                copyObservingModesMutation.mutate({
                    pathParams: {
                        cycleId: newCycle._id,
                        sourceCycleId: +sourceCycleId
                    }
                });
            }
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

    useEffect(() => {
        if (cyclesData.data != undefined) {
            setAvailableCycles(
                cyclesData.data.map((cycle) => (
                    {value: String(cycle.dbid), label: cycle.name ?? cycle.code ?? String(cycle.dbid)}
                ))
            );
        } else {
            setAvailableCycles([]);
        }
    }, [cyclesData.data]);

    useEffect(() => {
        form.setFieldValue('sourceCycleId', null);
        setAvailableCycles([]);
    }, [selectedObservatoryId]);

    function createCycle(values: NewCycleFormType) {
        if(values.observatoryId != undefined) {
            const newCycle: ProposalCycle = {
                code: values.cycleCode,
                title: values.title,
                observatory: {
                    "@type": "proposalManagement:Observatory",
                    _id: values.observatoryId
                },
                tac: {
                    members: []
                },
                availableResources: {
                    resources: [
                        {
                            type: {_id: observingTimeResourceType.data?.at(0)?.dbid!},
                            amount: 1000, //TODO: get from form values
                        }
                    ]
                },
                submissionDeadline: values.submissionDeadline!.getTime().toString(),
                observationSessionStart: values.sessionStart!.getTime().toString(),
                observationSessionEnd: values.sessionEnd!.getTime().toString(),
            }

            sourceCycleIdRef.current = values.sourceCycleId;
            createProposalCycleMutation.mutate({body: newCycle});

            closeModal && closeModal();
        } else {
            notifyError("Create cycle error", "Unable to use that observatory");
        }
    }

    if (observingTimeResourceType.isLoading) {
        return (
            <Loader/>
        )
    }

    if (observingTimeResourceType.isError || observingTimeResourceType.data?.length == 0) {
        return (
            <AlertErrorMessage
                title={"Resource type 'observing time' not found"}
                error={getErrorMessage(observingTimeResourceType.error)}
            />
        )
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
                    <TextInput
                        name={"code"}
                        label={"Cycle code"}
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        placeholder={"Give the proposal cycle a useful code"}
                        {...form.getInputProps('cycleCode')}
                        />
                    <Select
                        label={"Observatory"}
                        placeholder={"pick one"}
                        data={observatories}
                        {...form.getInputProps('observatoryId')}
                    />
                    <Select
                        label={"Copy observing modes from"}
                        placeholder={"select a cycle to copy observing modes from (optional)"}
                        data={availableCycles}
                        disabled={selectedObservatoryId == null || availableCycles.length === 0}
                        clearable
                        {...form.getInputProps('sourceCycleId')}
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