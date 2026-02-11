import React, {ReactElement, useState} from "react";
import {Button, Grid, Group, NumberInput, Space, Stack, Switch, Text, Textarea, Tooltip} from "@mantine/core";
import {
    useProposalReviewResourceConfirmReviewComplete,
    useProposalReviewResourceUpdateReviewComment,
    useProposalReviewResourceUpdateReviewFeasibility,
    useProposalReviewResourceUpdateReviewScore,
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {
    CLOSE_DELAY,
    ICON_SIZE,
    MAX_CHARS_FOR_REVIEW,
    OPEN_DELAY,
} from "../../constants.tsx";
import {IconSquareRoundedCheck} from "@tabler/icons-react";
import {useDebouncedCallback, useMediaQuery} from "@mantine/hooks";
import {ProposalReview} from "../../generated/proposalToolSchemas.ts";
import {useNavigate} from "react-router-dom";
import {modals} from "@mantine/modals";
import CancelButton from "../../commonButtons/cancel.tsx";
import {useQueryClient} from "@tanstack/react-query";

export default
function ReviewsForm(props: {
    cycleCode: number
    proposalId: number
    theReview: ProposalReview
}) : ReactElement {

    const smallScreen = useMediaQuery("(max-width: 1350px)");

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const commentMutation = useProposalReviewResourceUpdateReviewComment();
    const scoreMutation = useProposalReviewResourceUpdateReviewScore();
    const feasibilityMutation = useProposalReviewResourceUpdateReviewFeasibility();

    const confirmReview = useProposalReviewResourceConfirmReviewComplete()

    const [comment, setComment] = useState(props.theReview.comment);
    const [score, setScore] = useState(props.theReview.score);
    const [feasibility, setFeasibility] = useState(props.theReview.technicalFeasibility);
    const [changes, setChanges] = useState(false);

    const commentDebounce = useDebouncedCallback((commentUpdate: string) => {
        commentMutation
            .mutate({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposalId,
                    reviewId: props.theReview._id!
                },
                body: commentUpdate,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("Comment Updated", "Your changes to the comment have been saved")
                    setChanges(true)
                }

                ,
                onError: (error) =>
                    notifyError("Comment Update Failed", getErrorMessage(error))
            })
    }, 2000) // two-second debounce delay

    const scoreDebounce = useDebouncedCallback((scoreUpdate: number) => {
        scoreMutation
            .mutate({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposalId,
                    reviewId: props.theReview._id!
                },
                body: scoreUpdate === 0 ? '0' : scoreUpdate, //JSON encoding issue with 0
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("Score Updated", "Your score has been changed")
                    setChanges(true)
                }
                ,
                onError: (error) =>
                    notifyError("Score Update Failed", getErrorMessage(error))
            })
    }, 2000) // two-second debounce delay


    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.currentTarget.value);
        commentDebounce(e.currentTarget.value);
    }

    const handleScoreChange = (e: string | number) => {
        setScore(Number(e));
        scoreDebounce(Number(e));
    }

    //no debounce on this one
    const handleFeasibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFeasibility(e.currentTarget.checked);
        feasibilityMutation
            .mutate({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposalId,
                    reviewId: props.theReview._id!
                },
                body: e.currentTarget.checked ? true : "false", //JSON encoding - similar issue with 0 for numbers
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: (result) => {
                    notifySuccess("Feasibility Updated",
                        "The technical feasibility flag changed to " + (result.technicalFeasibility ? "yes" : "no"))
                    setChanges(true)
                }
                ,
                onError: (error) =>
                    notifyError("Feasibility Update Failed", getErrorMessage(error))
            })
    }

    const commentInput = () => (
        <Textarea
            label={"Please provide your comments:"}
            rows={10}
            maxLength={MAX_CHARS_FOR_REVIEW}
            description={
                (props.theReview.comment?.length ?
                    MAX_CHARS_FOR_REVIEW - props.theReview.comment?.length!
                        : MAX_CHARS_FOR_REVIEW
                )
                + "/" + String(MAX_CHARS_FOR_REVIEW)}
            inputWrapperOrder={['label', 'error', 'input', 'description']}
            value={comment}
            onChange={handleCommentChange}
        />
    )

    const scoreInput = () => (
        <NumberInput
            label={"Review Score: "}
            placeholder={"please provide a score"}
            hideControls
            value={score}
            onChange={handleScoreChange}
        />
    )

    const technicalFeasibilityInput = () => (
        <Switch
            label={"technically feasible?"}
            size={"md"}
            onLabel={"YES"}
            offLabel={"NO"}
            mt={"lg"}
            checked={feasibility}
            onChange={handleFeasibilityChange}
        />
    )

    const reviewCompletedButton = () => (
        <Tooltip
            label={ new Date(props.theReview.reviewDate!).getTime() > 0 && !changes ?
                'Make changes to enable':
                'Notifies TAC admin you have "completed" this review'}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconSquareRoundedCheck size={ICON_SIZE}/>}
                color={"orange"}
                variant={"outline"}
                onClick={confirmCompletion}
                disabled={
                    new Date(props.theReview.reviewDate!).getTime() > 0 && !changes
                }
            >
                Submit
            </Button>
        </Tooltip>
    )

    const handleCompletion = () => {
        confirmReview.mutate({
            pathParams: {
                cycleCode: props.cycleCode,
                submittedProposalId: props.proposalId,
                reviewId: props.theReview._id!,
            }
        }, {
            onSuccess: () =>{
                notifySuccess("Review Completed",
                    "You may make edits to this review at any time up to the TAC chair 'locking' reviews")
                queryClient.invalidateQueries().then(() => setChanges(false))
            }
            ,
            onError: (error) =>
                notifyError("Failed to Submit Review", getErrorMessage(error))
        })
    }

    const confirmCompletion = () => {
        modals.openConfirmModal({
            title: "Confirm submission of this review",
            centered: true,
            children: (
                <Text size={"sm"} c={"orange"}>
                    This notifies the TAC admin that you have "completed" this review.
                    Notice that you may make edits to this review and re-submit at
                    any time, up to the TAC admin locking the review process.

                    Are you sure you want to submit this review?
                </Text>
            ),
            labels: {confirm: "Submit", cancel: "No, do not submit"},
            confirmProps: {color: "orange"},
            onConfirm: () => handleCompletion()
        })
    }

    const handleCancel = () => {
        queryClient.invalidateQueries().then(
            () => navigate("../../../../", {relative:"path"})
        )
    }

    return (
        <Grid columns={10} gutter={"xl"}>
            <Grid.Col span={{base: 10, lg: 6}}>
                {commentInput()}
            </Grid.Col>
            <Grid.Col span={{base: 10, lg: 4}}>
                <Stack>
                    <Group mt={smallScreen? "xs" : "xl"}>
                        {scoreInput()}
                        {technicalFeasibilityInput()}
                    </Group>
                    <Space h={smallScreen ? "50px" : "100px"}/>

                    <Group justify={"flex-end"} >
                        {reviewCompletedButton()}
                        <CancelButton
                            toolTipLabel={"Go Back to Reviews page"}
                            label={"Go Back"}

                            onClick={handleCancel}
                        />
                    </Group>
                </Stack>
            </Grid.Col>
        </Grid>
    )
}