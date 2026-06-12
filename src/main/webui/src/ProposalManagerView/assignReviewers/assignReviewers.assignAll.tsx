import {ReactElement, useState} from "react";
import {Button, Divider, Group, Select, Text, Tooltip} from "@mantine/core";
import {
    useProposalReviewResourceAddReview,
    useReviewerResourceGetReviewers
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {CLOSE_DELAY, OPEN_DELAY} from "../../constants.tsx";
import {IconUsersPlus} from "@tabler/icons-react";

type AssignAllProps = {
    // the dbids of all proposals in the current cycle
    proposalIds: number[]
}

export default function AssignReviewerToAll(props: AssignAllProps): ReactElement {

    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

    const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);

    const reviewers = useReviewerResourceGetReviewers({});

    const addReview = useProposalReviewResourceAddReview();

    if (reviewers.error) {
        notifyError("Failed to load reviewers", getErrorMessage(reviewers.error));
        return <></>;
    }

    const reviewerSelectData = reviewers.data?.map(r => ({
        value: String(r.dbid),
        label: r.name ?? String(r.dbid)
    })) ?? [];

    const handleAssignAll = () => {
        if (!selectedReviewerId) return;

        const reviewerId = Number(selectedReviewerId);
        const reviewerName = reviewers.data?.find(
            r => r.dbid === reviewerId
        )?.name ?? "Reviewer";

        let successCount = 0;
        let errorCount = 0;
        const total = props.proposalIds.length;

        const finalize = () => {
            if (successCount + errorCount === total) {
                queryClient.invalidateQueries().then(() => {
                    if (successCount > 0) {
                        notifySuccess(
                            "Assign to All Complete",
                            `${reviewerName} assigned to ${successCount} proposal(s)` +
                            (errorCount > 0 ? ` (${errorCount} skipped or failed)` : "")
                        );
                    } else {
                        notifyError(
                            "Assign to All Failed",
                            `${reviewerName} could not be assigned to any proposals`
                        );
                    }
                });
            }
        };

        props.proposalIds.forEach(proposalId => {
            addReview.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    submittedProposalId: proposalId
                },
                body: {
                    comment: "",
                    score: 0,
                    technicalFeasibility: false,
                    reviewer: {_id: reviewerId}
                }
            }, {
                onSuccess: () => {
                    successCount++;
                    finalize();
                },
                onError: () => {
                    errorCount++;
                    finalize();
                }
            });
        });
    };

    return (
        <>
            <Group align={"flex-end"} mb={"md"}>
                <Select
                    label={"Assign a reviewer to all proposals"}
                    placeholder={"Select a reviewer"}
                    data={reviewerSelectData}
                    value={selectedReviewerId}
                    onChange={setSelectedReviewerId}
                    clearable
                    w={300}
                />
                <Tooltip
                    label={"Assign selected reviewer to all proposals in this cycle"}
                    openDelay={OPEN_DELAY}
                    closeDelay={CLOSE_DELAY}
                    disabled={!selectedReviewerId || props.proposalIds.length === 0}
                >
                    <Button
                        leftSection={<IconUsersPlus size={16}/>}
                        color={"blue"}
                        variant={"subtle"}
                        disabled={!selectedReviewerId || props.proposalIds.length === 0}
                        onClick={handleAssignAll}
                    >
                        Assign to All
                    </Button>
                </Tooltip>
                {props.proposalIds.length === 0 && (
                    <Text size={"sm"} c={"dimmed"}>
                        No proposals available to assign
                    </Text>
                )}
            </Group>
            <Divider mb={"md"} />
        </>
    );
}
