import {ReactElement, useEffect, useState} from "react";
import {SubmitButton} from "../commonButtons/save.tsx";
import {useForm} from "@mantine/form";
import {ObjectIdentifier} from "../generated/proposalToolSchemas.ts";
import {Select, Text, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../constants.tsx";
import MaxCharsForInputRemaining from "../commonInputs/remainingCharacterCount.tsx";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {fetchObservatoryResourceGetObservatories} from "../generated/proposalToolComponents.ts";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../errorHandling/getErrorMessage.tsx";

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

    const [observatories, setObservatories]
        = useState<{ value: string, label: string }[]>([]);

    useEffect(() => {
        fetchObservatoryResourceGetObservatories({})
            .then((data: ObjectIdentifier[]) => {
                setObservatories(
                    data?.map((obs) => (
                        {value: String(obs.dbid), label: obs.name!}
                    ))
                );
            })
            .catch((error) => {
                notifications.show({
                    autoClose: false,
                    title: "Loading Observatories failed",
                    message: "Cannot load Observatories, caused by " + getErrorMessage(error)
                });
            });

    }, []);


    const form = useForm<NewCycleFormType>(
        {
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
        //we will have to convert dates to number of seconds since posix epoch
        console.log(values);

        closeModal && closeModal();
    }

    return (
        <form onSubmit={form.onSubmit((values) => createCycle(values))}>
            <SubmitButton toolTipLabel={"save a new proposal cycle"}
                          disabled={!form.isValid()}
            />
            <DatesProvider settings={{timezone: 'UTC'}}>
                <TextInput
                    name={"title"}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    placeholder={"Proposal Cycle title"}
                    label={"Title"}
                    {...form.getInputProps('title')}
                />
                <MaxCharsForInputRemaining length={form.values.title.length}/>
                <DateTimePicker
                    placeholder={"submission deadline"}
                    minDate={new Date()}
                    rightSection={<Text>submission deadline</Text>}
                    {...form.getInputProps('submissionDeadline')}
                />
                <DateTimePicker
                    placeholder={"session start"}
                    minDate={new Date()}
                    rightSection={<Text>session start</Text>}
                    {...form.getInputProps('sessionStart')}
                />
                <DateTimePicker
                    placeholder={"session end"}
                    minDate={new Date()}
                    rightSection={<Text>session end</Text>}
                    {...form.getInputProps('sessionEnd')}
                />
                <Select
                    label={"Observatory"}
                    placeholder={"pick one"}
                    data={observatories}
                    {...form.getInputProps('observatoryId')}
                />
            </DatesProvider>
        </form>
    )
}