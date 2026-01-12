import React, {ReactElement, useEffect, useState} from "react";
import {Button, Grid, Group, Loader, NumberInput, Space, Stack, Switch, Text, Textarea, Tooltip} from "@mantine/core";
import {
    fetchJustificationsResourceDownloadReviewerZip,
    useProposalReviewResourceConfirmReviewComplete,
    useProposalReviewResourceGetReview, useProposalReviewResourceUpdateReviewComment,
    useProposalReviewResourceUpdateReviewFeasibility,
    useProposalReviewResourceUpdateReviewScore,
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {
    CLOSE_DELAY,
    ICON_SIZE,
    MAX_CHARS_FOR_REVIEW,
    OPEN_DELAY,
} from "../../constants.tsx";
import {IconSquareRoundedCheck} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import {useToken} from "../../App2.tsx";
import {useDebouncedCallback, useMediaQuery} from "@mantine/hooks";
import {ExportButton} from "../../commonButtons/export.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";

export default
function ReviewsForm(props: {
    cycleCode: number,
    proposalId: number,
    reviewId: number, //assume calling context has passed in a valid value
    reviewerId: number,
    proposalTitle: string,
    reviewsLocked: boolean,
    setFormDirty: React.Dispatch<React.SetStateAction<boolean>>
}) : ReactElement {

    const commentLengthZeroMsg =
        "You must update this review with at least a comment before you can submit"

    const authToken = useToken();

    const queryClient = useQueryClient();

    const smallScreen = useMediaQuery("(max-width: 1350px)");

    const commentMutation = useProposalReviewResourceUpdateReviewComment();
    const scoreMutation = useProposalReviewResourceUpdateReviewScore();
    const feasibilityMutation = useProposalReviewResourceUpdateReviewFeasibility();

    const confirmReview = useProposalReviewResourceConfirmReviewComplete()

    const theReview = useProposalReviewResourceGetReview({
        pathParams: {
            cycleCode: props.cycleCode,
            submittedProposalId: props.proposalId,
            reviewId: props.reviewId!,
        }
    })

    const [comment, setComment] = useState("");
    const [score, setScore] = useState(0);
    const [feasibility, setFeasibility] = useState(false);

    useEffect(() => {
        if (theReview.status === 'success') {
            setComment(theReview.data?.comment!);
            setScore(theReview.data?.score!);
            setFeasibility(theReview.data?.technicalFeasibility!)
        }
    }, [theReview.status, theReview.data])


    const commentDebounce = useDebouncedCallback((commentUpdate: string) => {
        commentMutation
            .mutate({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposalId,
                    reviewId: props.reviewId
                },
                body: commentUpdate,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("Comment Updated", "Your changes to the comment have been saved")
                    props.setFormDirty(true)
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
                    reviewId: props.reviewId
                },
                body: scoreUpdate === 0 ? '0' : scoreUpdate, //JSON encoding issue with 0
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    notifySuccess("Score Updated", "Your score has been changed")
                    props.setFormDirty(true)
                }
                ,
                onError: (error) =>
                    notifyError("Score Update Failed", getErrorMessage(error))
            })
    }, 2000) // two-second debounce delay

    if (theReview.isLoading) {
        return (<Loader/>)
    }

    if (theReview.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load the review"}
                error={getErrorMessage(theReview.error)}
            />
        )
    }




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
        //setFeasibility(e.currentTarget.checked);
        feasibilityMutation
            .mutate({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposalId,
                    reviewId: props.reviewId
                },
                body: e.currentTarget.checked ? true : "false", //JSON encoding - similar issue with 0 for numbers
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: (result) => {
                    queryClient.invalidateQueries().then(
                        () => {
                            setFeasibility(result.technicalFeasibility!)
                            notifySuccess("Feasibility Updated",
                                "The technical feasibility flag changed to "
                                + (result.technicalFeasibility ? "yes" : "no"))
                        }
                    )
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
                (theReview.data?.comment?.length ?
                    MAX_CHARS_FOR_REVIEW - theReview.data?.comment?.length!
                        : MAX_CHARS_FOR_REVIEW
                )
                + "/" + String(MAX_CHARS_FOR_REVIEW)}
            inputWrapperOrder={['label', 'error', 'input', 'description']}
            disabled={props.reviewsLocked}
            value={comment}
            onChange={handleCommentChange}
        />
    )

    const scoreInput = () => (
        <NumberInput
            label={"Review Score: "}
            placeholder={"please provide a score"}
            hideControls
            disabled={props.reviewsLocked}
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
            disabled={props.reviewsLocked}
            mt={"lg"}
            checked={feasibility}
            onChange={handleFeasibilityChange}
        />
    )

    const reviewSubmitButton = () => (
        <Tooltip
            label={
            props.reviewsLocked ? "Reviews locked" :
                (theReview.data?.comment?.length === undefined || theReview.data?.comment?.length === 0) ? commentLengthZeroMsg :
                    "Notifies TAC admin you have completed this review"
            }
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            multiline
            w={150}
        >
            <Button
                rightSection={<IconSquareRoundedCheck size={ICON_SIZE}/>}
                color={"orange"}
                variant={"outline"}
                onClick={confirmCompletion}
                disabled={
                    theReview.data?.comment?.length === undefined ||
                    theReview.data?.comment?.length == 0 ||
                    new Date(theReview.data?.reviewDate!).getTime() > 0 ||
                    props.reviewsLocked}
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
                reviewId: props.reviewId,
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() => {
                        notifySuccess("Success", "This review has been submitted")
                        props.setFormDirty(false)
                    })
            },
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
                    This notifies the TAC admin that you have "finished" this review.
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

    function downloadReviewPDF() {
        fetchJustificationsResourceDownloadReviewerZip({
            pathParams: {proposalCode: props.proposalId},
            headers: {authorization: `Bearer ${authToken}`}
        })
            .then((reviewPDF) => {
                if (reviewPDF) {
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(reviewPDF);
                    link.download = props.proposalId + " "
                        + props.proposalTitle.replace(/([^a-z0-9\s.]+)/gi, '_')
                            .substring(0,30)
                        + ".zip";
                    link.click();
                } else
                    notifyError("Failed to download review", "The file is empty")
            })
            .then(() => notifySuccess("Download review", "The ZIP has downloaded"))
            .catch(error => notifyError("Failed to download review", getErrorMessage(error)))
    }

    return (
        <Grid columns={10} gutter={"xl"}>
            <Grid.Col span={{base: 10, lg: 6}}>
                <ExportButton
                    onClick={() => downloadReviewPDF()}
                    toolTipLabel={"Download a PDF of this proposal"}
                    label={"Download pdf"}
                />
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
                        {reviewSubmitButton()}
                    </Group>
                </Stack>
            </Grid.Col>
        </Grid>
    )
}