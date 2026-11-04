import {ReactElement, useEffect, useState} from "react";
import {
    Box, Button, Fieldset, Group, Loader, Stack, Text, TextInput, Title
} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import { useQueryClient } from "@tanstack/react-query";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";
import {
    useProposalCyclesResourceGetObservatoryQuestions, useProposalCyclesResourceSaveObservatoryQuestions
} from "../../generated/proposalToolComponents.ts";
import {ObservatoryQuestion} from "../../generated/proposalToolSchemas.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";

interface observatoryQuestionsProps {
    proposalId: number;
    cycleCode: number;
}

export default function ObservatoryQuestions({ proposalId, cycleCode }: observatoryQuestionsProps): ReactElement {
    const queryClient = useQueryClient();

    // ---- Fetch questions from the backend ----

    const questions =
        useProposalCyclesResourceGetObservatoryQuestions({
            pathParams: { cycleCode: cycleCode },
            queryParams: { proposalId: proposalId}
        })

    const [responses, setResponses] = useState<ObservatoryQuestion[]>([]);

    useEffect(() => {
        if (questions.data) {
            setResponses(questions.data);
        }
    }, [questions.data])

    // ---- Submit answered questions to the backend ----
    const submitMutation =
        useProposalCyclesResourceSaveObservatoryQuestions()


    const handleSaveResponses = () => {
        submitMutation.mutate({
            pathParams: { cycleCode: cycleCode, proposalId: proposalId },
            body: responses,
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries().then(() =>
                    notifySuccess("Responses Saved",
                        "Your responses to the observatory-specific questions have been saved.")
                );
            },
            onError: (error) => {
                notifyError("Failed to save responses", getErrorMessage(error));
            }
        })
    }

    if (cycleCode <= 0) return <Text c="dimmed">Please select a proposal cycle first.</Text>;
    if (questions.isLoading) return <Loader />;
    if (questions.isError)
        return (
            <AlertErrorMessage
                title="Failed to load observatory questions"
                error={getErrorMessage(questions.error)}
            />
        );

    return (
        <Box>
            <Title order={4} mb="md">Observatory-Specific Questions</Title>
            {questions.data?.length === 0 ? (
                <Text c="dimmed">No observatory-specific questions for this proposal cycle.</Text>
            ) : (
                <Fieldset legend="Please answer the following questions">
                    <Stack>
                        {questions.data?.map((q, index) => (
                            <Fieldset key={q.id} legend={q.label}>
                                <TextInput
                                    label={q.query}
                                    description={q.description}
                                    minLength={q.minChar}
                                    maxLength={q.maxChar}
                                    value={q.response}
                                    onChange={(event) => {
                                        const newResponses = [...responses];
                                        newResponses[index] =
                                            { ...newResponses[index], response: event.target.value };
                                        setResponses(newResponses);
                                    }}
                                />
                                <MaxCharsForInputRemaining
                                    length={questions.data[index].response?.length ?? 0}
                                    limit={q.maxChar}
                                />
                            </Fieldset>
                        ))}
                    </Stack>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            loading={submitMutation.isPending}
                            onClick={handleSaveResponses}
                        >
                            Save Responses
                        </Button>
                    </Group>
                </Fieldset>

            )}
        </Box>
    );
}