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
    setAllQuestionsAnswered: React.Dispatch<React.SetStateAction<boolean>>;
    smallScreen?: boolean;
}

export default function ObservatoryQuestions(
    {
        proposalId,
        cycleCode,
        setAllQuestionsAnswered,
        smallScreen
    }: observatoryQuestionsProps): ReactElement {

    const queryClient = useQueryClient();

    // ---- Fetch questions from the backend ----

    const questions =
        useProposalCyclesResourceGetObservatoryQuestions({
            pathParams: { cycleCode: cycleCode },
            queryParams: { proposalId: proposalId}
        })

    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [responses, setResponses] = useState<ObservatoryQuestion[]>([]);
    const [questionsAnswered, setQuestionsAnswered] = useState<boolean[]>([]);

    useEffect(() => {
        if (questions.data) {
            setResponses(questions.data);
            setQuestionsAnswered(questions.data.map(q =>
                q.response ? q.response.length >= q.minChar! : q.minChar! < 1)
            );
            setAllQuestionsAnswered(questions.data.every(q =>
                q.response ? q.response.length >= q.minChar! : q.minChar! < 1)
            );
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
                setUnsavedChanges(false);
                setAllQuestionsAnswered(questionsAnswered.every(answered => answered));
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
        <Box
            maw={smallScreen ? "100%": "75%"}
            ml={smallScreen ? "" : "10%"}
        >
            <Title order={4} mb="md">Observatory-Specific Questions</Title>
            {questions.data?.length === 0 ? (
                <Text c="dimmed">There are no observatory-specific questions for this proposal cycle.</Text>
            ) : (
                <Fieldset legend="Please answer the following questions">
                    { unsavedChanges && <Text size="sm" c="red">You have unsaved changes</Text> }
                    <Stack>
                        {questions.data?.map((q, index) => (
                            <Fieldset key={q.id} legend={q.label}>
                                <TextInput
                                    label={q.query}
                                    description={q.description}
                                    minLength={q.minChar}
                                    maxLength={q.maxChar}
                                    value={responses[index]?.response ?? ""}
                                    onChange={(event) => {
                                        const newResponses = [...responses];
                                        newResponses[index] =
                                            { ...newResponses[index], response: event.target.value };
                                        setResponses(newResponses);
                                        const newQuestionsAnswered = [...questionsAnswered];
                                        newQuestionsAnswered[index] = event.target.value.length >= q.minChar!;
                                        setQuestionsAnswered(newQuestionsAnswered);
                                        // prevent the user from proceeding to the next step if there are unsaved changes
                                        setAllQuestionsAnswered(false);
                                        setUnsavedChanges(true);
                                    }}
                                />
                                <MaxCharsForInputRemaining
                                    length={responses[index]?.response?.length ?? 0}
                                    limit={q.maxChar}
                                />
                            </Fieldset>
                        ))}
                    </Stack>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            loading={submitMutation.isPending}
                            onClick={handleSaveResponses}
                            disabled={!unsavedChanges}
                            color={"blue"}
                        >
                            Save Responses
                        </Button>
                    </Group>
                </Fieldset>

            )}
        </Box>
    );
}