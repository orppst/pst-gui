import {ReactElement, useEffect, useRef, useState} from "react";
import {FormSubmitButton} from "../commonButtons/save.tsx";
import {useForm} from "@mantine/form";
import {ProposalCycle} from "../generated/proposalToolSchemas.ts";
import {Group, Loader, NumberInput, Select, Stack, Text, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import {DateTimePicker} from "@mantine/dates";
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

    const observingTime = "observing time"

    interface NewCycleFormType {
        title: string,
        cycleCode: string,
        submissionDeadline: string | null,
        sessionStart: string | null,
        sessionEnd: string | null,
        observatoryId: number | null,
        sourceCycleId: string | null,
        observingHours: number | null
    }
    const queryClient = useQueryClient();

    const [observatories, setObservatories]
        = useState<{ value: string, label: string }[]>([]);

    const [availableCycles, setAvailableCycles]
        = useState<{ value: string, label: string }[]>([]);

    const sourceCycleIdRef = useRef<string | null>(null);

    const availableObservatories =
        useObservatoryResourceGetObservatories({queryParams: {}});

    //hard coded name "observing time" used
    const observingTimeResourceType =
        useResourceTypeResourceGetAllResourceTypes({
            queryParams: {resourceTypeName: `%${observingTime}%`}
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
                sourceCycleId: null,
                observingHours: null
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
                    value => (value === undefined ? 'Please select an observatory' : null),
                observingHours:
                    value => (value === null ? 'Please specify the number of observing hours, can be zero' : null),
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
        if(availableObservatories.status == 'success')
            setObservatories(
                availableObservatories.data?.map((obs) => (
                  {value: String(obs.dbid), label: obs.name!}
              ))
        );
    }, [availableObservatories.data, availableObservatories.status]);

    useEffect(() => {
        if (cyclesData.status == 'success') {
            setAvailableCycles(
                cyclesData.data.map((cycle) => (
                    {value: String(cycle.dbid), label: cycle.name ?? cycle.code ?? String(cycle.dbid)}
                ))
            );
        } else {
            setAvailableCycles([]);
        }
    }, [cyclesData.data, cyclesData.status]);

    useEffect(() => {
        form.setFieldValue('sourceCycleId', null);
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
                            //already checked and caught zero length array
                            type: {_id: observingTimeResourceType.data?.at(0)?.dbid!},
                            amount: values.observingHours!
                        }
                    ]
                },
                //API does not like date-time strings, we convert to no. of ms from posix epoch, then
                // stringify that number to appease the TypeScript gods
                submissionDeadline: new Date(values.submissionDeadline!).getTime().toString(),
                observationSessionStart: new Date(values.sessionStart!).getTime().toString(),
                observationSessionEnd: new Date(values.sessionEnd!).getTime().toString(),
            }

            sourceCycleIdRef.current = values.sourceCycleId;
            createProposalCycleMutation.mutate({body: newCycle});

            closeModal && closeModal();
        } else {
            notifyError("Create cycle error", "Unable to use that observatory");
        }
    }

    if (observingTimeResourceType.isLoading || availableObservatories.isLoading) {
        return (
            <Loader/>
        )
    }

    if (observingTimeResourceType.isError || observingTimeResourceType.data?.length == 0) {
        return (
            <AlertErrorMessage
                title={`Resource type '${observingTime}' not found`}
                error={getErrorMessage(observingTimeResourceType.error)}
            />
        )
    }

    if (availableObservatories.isError || availableObservatories.data?.length == 0) {
        return (
            <AlertErrorMessage
                title={"No 'Observatories' found"}
                error={getErrorMessage(availableObservatories.error)}
            />
        )
    }

    return (
        <form onSubmit={form.onSubmit((values) => createCycle(values))}>
            <Stack>
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
                    placeholder={"give the proposal cycle a title"}
                    {...form.getInputProps('title')}
                />
                <TextInput
                    name={"code"}
                    label={"Cycle code"}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    placeholder={"specify an alphanumeric code for this cycle"}
                    {...form.getInputProps('cycleCode')}
                    />
                <Select
                    label={"Observatory"}
                    placeholder={"pick one"}
                    data={observatories}
                    {...form.getInputProps('observatoryId')}
                />
                <NumberInput
                    label={"Observing time (hours)"}
                    hideControls
                    min={0}
                    clampBehavior={"strict"}
                    placeholder={"total observing time in hours for this cycle"}
                    {...form.getInputProps('observingHours')}
                />
                <Select
                    label={"Copy observing modes from (optional)"}
                    placeholder={"select a previous cycle to copy observing modes from"}
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
        </form>
    )
}