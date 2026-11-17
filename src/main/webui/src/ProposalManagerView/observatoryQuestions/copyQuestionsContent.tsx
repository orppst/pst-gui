import {ReactElement, useEffect, useState} from "react";
import {
    useProposalCyclesResourceCopyObservatoryQuestions,
    useProposalCyclesResourceGetProposalCycles
} from "../../generated/proposalToolComponents.ts";
import {Button, Loader, Select, Stack, Text} from "@mantine/core";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";

export default function CopyQuestionsContent(props: {
    closeModal: () => void,
    cycleCode: number,
    observatoryId: number
})
    : ReactElement {
    const queryClient = useQueryClient();

    const {closeModal, cycleCode, observatoryId} = props;

    const [sourceCycleCode, setSourceCycleCode] = useState<number | null>(null);

    const [availableCycles, setAvailableCycles]
        = useState<{ value: string, label: string }[]>([]);

    const cyclesWithQuestions = useProposalCyclesResourceGetProposalCycles({
        queryParams: {
            observatoryId: observatoryId,
            includeClosed: true,
            hasQuestionsTemplate: true
        }
    });

    const copyMutation =
        useProposalCyclesResourceCopyObservatoryQuestions();

    useEffect(() => {
        if (cyclesWithQuestions.data) {
            const cycles = cyclesWithQuestions.data
                .filter((cycle) => cycle.dbid !== cycleCode)
                .map((cycle) => ({
                value: cycle.dbid!.toString(),
                label: cycle.name!
            }));
            setAvailableCycles(cycles);
        }
    }, [cyclesWithQuestions.data]);

    const handleCopy = () => {
        if (sourceCycleCode !== null) {
            copyMutation.mutate(
                {pathParams: {cycleCode: cycleCode, sourceCycleCode: sourceCycleCode}},
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries().then(() => {
                            notifySuccess("Copy Successful",
                                "Observatory questions have been copied.");
                            closeModal();
                        });
                    },
                    onError: (error) => {
                        notifyError("Copy Failed", getErrorMessage(error));
                    }
                }
            );
        }
    };

    if (cyclesWithQuestions.isLoading) {
        return <Loader/>;
    }

    if (cyclesWithQuestions.isError) {
        return <Text>Error loading proposal cycles with questions.</Text>;
    }

    return (
        <Stack>
            {availableCycles.length === 0 ?
                <Text>No previous cycles have questions to copy.</Text>
                :
                <Select
                    data={availableCycles}
                    placeholder="Select a cycle to copy questions from"
                    onChange={(value) => setSourceCycleCode(Number(value))}
                />
            }
            <Button
                onClick={handleCopy}
                disabled={!sourceCycleCode}
            >
                Copy Questions
            </Button>
        </Stack>

    )
}