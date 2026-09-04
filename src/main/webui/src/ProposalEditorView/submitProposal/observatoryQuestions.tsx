import { ReactElement, useState } from "react";
import {
    Box, Button, Fieldset, Group, Loader, Stack, Text, TextInput, Title
} from "@mantine/core";
import { useForm } from "@mantine/form";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import { useProposalToolContext } from "../../generated/proposalToolContext.ts";
import { proposalToolFetch } from "../../generated/proposalToolFetcher.ts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";

// ---- Types matching ObservatoryQuestion.java ----
// TODO: Replace with OpenAPI generated code when available
interface ObservatoryQuestion {
    id: number;
    label: string;
    description: string;
    query: string;
    response: string;
    minChar: number;
    maxChar: number;
}

interface FormValues {
    questions: ObservatoryQuestion[];
}

interface Props {
    cycleCode: number;
}

export default function ObservatoryQuestions({ cycleCode }: Props): ReactElement {
    const { fetcherOptions } = useProposalToolContext();
    const queryClient = useQueryClient();
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // ---- Fetch questions from the backend ----
    // TODO: Replace with OpenAPI generated code when available
    const {
        data: questions,
        isLoading,
        isError,
        error,
    } = useQuery<ObservatoryQuestion[], Error>({
        queryKey: ["observatoryQuestions", cycleCode],
        queryFn: ({ signal }) =>
            proposalToolFetch<ObservatoryQuestion[], Error, undefined, {}, {}, {}>({
                url: `/pst/api/proposalCycles/${cycleCode}/observatoryQuestions`,
                method: "get",
                signal,
                ...fetcherOptions,
            }),
        enabled: cycleCode > 0,
    });

    const form = useForm<FormValues>({
        initialValues: { questions: [] },
    });

    // Populate form once questions are loaded
    if (questions && form.values.questions.length === 0) {
        form.setFieldValue("questions", questions);
    }

    // ---- Submit answered questions to the backend ----
    // TODO: Replace with OpenAPI generated code when available
    const submitMutation = useMutation<void, Error, ObservatoryQuestion[]>({
        mutationFn: (answered) =>
            proposalToolFetch<void, Error, ObservatoryQuestion[], {}, {}, {}>({
                url: `/pst/api/proposalCycles/${cycleCode}/observatoryQuestions`,
                method: "post",
                body: answered,
                ...fetcherOptions,
            }),
        onSuccess: () => {
            setSubmitSuccess(true);
            queryClient.invalidateQueries({ queryKey: ["observatoryQuestions", cycleCode] });
        },
    });

    if (cycleCode <= 0) return <Text c="dimmed">Please select a proposal cycle first.</Text>;
    if (isLoading) return <Loader />;
    if (isError)
        return (
            <AlertErrorMessage
                title="Failed to load observatory questions"
                error={getErrorMessage(error)}
            />
        );

    return (
        <Box>
            <Title order={4} mb="md">Observatory-Specific Questions</Title>
            <form
                onSubmit={form.onSubmit((values) =>
                    submitMutation.mutate(values.questions)
                )}
            >
                <Stack>
                    {form.values.questions.map((q, index) => (
                        <Fieldset key={q.id} legend={q.label}>
                            <TextInput
                                label={q.query}
                                description={q.description}
                                minLength={q.minChar}
                                maxLength={q.maxChar}
                                {...form.getInputProps(`questions.${index}.response`)}
                            />
                            <MaxCharsForInputRemaining
                                length={form.values.questions[index].response?.length ?? 0}
                                limit={q.maxChar}
                            />
                        </Fieldset>
                    ))}
                </Stack>

                {submitMutation.isError && (
                    <AlertErrorMessage
                        title="Submission failed"
                        error={getErrorMessage(submitMutation.error)}
                    />
                )}

                {submitSuccess && (
                    <Text c="green" mt="md">Responses submitted successfully.</Text>
                )}

                <Group justify="flex-end" mt="xl">
                    <Button type="submit" loading={submitMutation.isPending}>
                        Save Responses
                    </Button>
                </Group>
            </form>
        </Box>
    );
}