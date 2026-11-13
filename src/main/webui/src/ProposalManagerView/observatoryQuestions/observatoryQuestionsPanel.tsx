import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {ReactElement, useEffect, useState} from "react";
import {
    useProposalCyclesResourceGetObservatoryQuestions,
    useProposalCyclesResourceSaveObservatoryQuestionsTemplate
} from "../../generated/proposalToolComponents.ts";
import {Accordion, Fieldset, Group, Loader, NumberInput, Space, Stack, Text, TextInput} from "@mantine/core";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObservatoryQuestion} from "../../generated/proposalToolSchemas.ts";
import {useForm, UseFormReturnType} from "@mantine/form";
import AddButton from "../../commonButtons/add.tsx";
import {AccordionRemove} from "../../commonButtons/accordianControls.tsx";
import {modals} from "@mantine/modals";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";

interface observatoryQuestionsInterface {
    questions: ObservatoryQuestion[];
}

export default function ObservatoryQuestionsPanel(): ReactElement {

    const queryClient = useQueryClient();

    const {selectedCycleCode} = useParams();

    const [maxId, setMaxId] = useState(0);

    const newObservatoryQuestion : ObservatoryQuestion = {
        label: "**EDIT ME**: Please provide a label for this question.",
        description: "**EDIT ME**: Please provide a description for this question.",
        query: "**EDIT ME**: Please enter your question here.",
        response: "", // default empty response (filled in by the user)
        minChar: 0,
        maxChar: 1 // default maxChar of 1 (must be > 0)
    };

    // ---- Fetch questions from the backend if they exist ----
    const questions =
        useProposalCyclesResourceGetObservatoryQuestions({
            pathParams: { cycleCode: Number(selectedCycleCode) }
        })

    const submitMutation =
        useProposalCyclesResourceSaveObservatoryQuestionsTemplate()

    const form: UseFormReturnType<observatoryQuestionsInterface> =
        useForm<observatoryQuestionsInterface>({
            initialValues: {
                questions: questions.data || []
            }
        });

    useEffect(() => {
        if (questions.data) {
            form.setValues({ questions: questions.data });
            setMaxId(Math.max(...questions.data.map(q => q.id || 0)));
        }
    }, [questions.data]);


    const confirmRemove = (index: number, label: string) =>
        modals.openConfirmModal({
            title: 'Confirm Delete',
            children: (
                <Stack>
                    <Text size="sm">
                        Are you sure you want to delete the question "{label}"?
                    </Text>
                </Stack>
            ),
            labels: { confirm: "Delete", cancel: "No, don't delete" },
            confirmProps: { color: 'red' },
            onConfirm: () => {
                form.removeListItem('questions', index);
                // update the backend with the modified list of questions
                // regardless of whether the question was previously saved.
                submitMutation.mutate({
                    pathParams: { cycleCode: Number(selectedCycleCode) },
                    body: form.getValues().questions,
                }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries().then(() =>
                            notifySuccess("Question Deleted",
                                "The observatory-specific question has been deleted.")
                        );
                    },
                    onError: (error) => {
                        notifyError("Failed to delete question", getErrorMessage(error));
                    }
                })
            },
        });


    const questionsList = form.getValues().questions.map(
        (question : ObservatoryQuestion, index: number) => {
            return (
                <Accordion.Item value={index.toString()} key={question.id}>
                    <AccordionRemove
                        title={question.label!}
                        removeProps={{
                            toolTipLabel: "Delete this question",
                            onClick: () => confirmRemove(index, question.label!)
                        }}
                    />
                    <Accordion.Panel>
                        <TextInput
                            label={"Label"}
                            description={"Please provide a label for this question."}
                            {...form.getInputProps(`questions.${index}.label`)}
                        />
                        <TextInput
                            label={"Description"}
                            description={"A brief description of the question, used for extra information."}
                            {...form.getInputProps(`questions.${index}.description`)}
                        />
                        <TextInput
                            label={"Query"}
                            description={"The question to be answered by the user."}
                            {...form.getInputProps(`questions.${index}.query`)}
                        />
                        <NumberInput
                            label={"Minimum Characters"}
                            description={"The minimum number of characters required for the response. If zero, the question is assumed optional."}
                            min={0}
                            {...form.getInputProps(`questions.${index}.minChar`)}
                        />
                        <NumberInput
                            label={"Maximum Characters"}
                            description={"The maximum number of characters allowed for the response. Cannot be set to zero."}
                            min={1}
                            {...form.getInputProps(`questions.${index}.maxChar`)}
                        />
                    </Accordion.Panel>
                </Accordion.Item>
            )
        })

    const handleSubmit =
        form.onSubmit((values) => {
            submitMutation.mutate({
                pathParams: { cycleCode: Number(selectedCycleCode) },
                body: values.questions,
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries().then(() =>
                        notifySuccess("Questions Saved",
                            "Your observatory-specific questions have been saved.")
                    );
                },
                onError: (error) => {
                    notifyError("Failed to save questions", getErrorMessage(error));
                }
            })
        })

    if (questions.isLoading) {
        return ( <Loader /> );
    }

    if (questions.isError) {
        return <AlertErrorMessage
            title={"Error fetching observatory questions"}
            error={getErrorMessage(questions.error)}
        />
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Observatory Questions"}
            />
            <form onSubmit={handleSubmit}>
                <Fieldset legend="List of questions">
                    <Accordion chevronPosition={"left"}>
                        {questionsList}
                    </Accordion>
                    <Space h={"md"}/>
                    <Group justify={"center"}>
                        <AddButton
                            toolTipLabel={"Add a new observatory question"}
                            onClick={() => {
                                setMaxId(prev => prev + 1);
                                form.insertListItem(
                                    'questions',
                                    {...newObservatoryQuestion, id: maxId + 1})
                            }}
                        />
                    </Group>
                </Fieldset>
                <Space h={"md"}/>
                <Group justify={"center"}>
                    <FormSubmitButton form={form} toolTipLabel={"Save observatory questions"}/>
                </Group>
            </form>
        </PanelFrame>
    );

}