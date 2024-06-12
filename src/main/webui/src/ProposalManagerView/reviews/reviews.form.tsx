import {ReactElement} from "react";
import {Badge, Button, Grid, Group, NumberInput, Stack, Switch, Text, Textarea, Tooltip} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
import {ReviewsProps} from "./ReviewsPanel.tsx";
import {
    fetchProposalReviewResourceAddReview, fetchProposalReviewResourceConfirmReviewComplete,
    fetchProposalReviewResourceUpdateReviewComment, fetchProposalReviewResourceUpdateReviewFeasibility,
    fetchProposalReviewResourceUpdateReviewScore,
    useReviewerResourceGetReviewer
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useForm} from "@mantine/form";
import {CLOSE_DELAY, ICON_SIZE, MAX_CHARS_FOR_INPUTS, OPEN_DELAY, TEXTAREA_MAX_ROWS} from "../../constants.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {IconSquareRoundedCheck} from "@tabler/icons-react";
import {modals} from "@mantine/modals";

export default
function ReviewsForm(props: ReviewsProps) : ReactElement {

    const queryClient = useQueryClient();

    const theReviewer = useReviewerResourceGetReviewer({
        pathParams: {reviewerId: props.reviewerId}
    })

    const theReview = props.proposal?.reviews?.find(
        r => r.reviewer?._id == props.reviewerId)

    interface ReviewFormValues {
        comment: string,
        score: number,
        technicalFeasibility: boolean
    }

    const form = useForm<ReviewFormValues>({
        initialValues: {
            comment: theReview ? theReview.comment! : "",
            score: theReview ? theReview.score! : 0,
            technicalFeasibility: theReview ? theReview.technicalFeasibility! : false
        },
        validate: {
            comment: value => (value.length == 0 ?
                "Please provide a brief comment on the proposal" : null),
        }
    })

    if (theReviewer.error) {
        notifyError("Failed to load the reviewer", getErrorMessage(theReviewer.error))
    }

    const commentInput = () => (
        <Textarea
            disabled={isReviewComplete}
            label={"Please provide your comments:"}
            rows={TEXTAREA_MAX_ROWS}
            maxLength={MAX_CHARS_FOR_INPUTS}
            description={
                MAX_CHARS_FOR_INPUTS -
                form.values.comment.length +
                "/" + String(MAX_CHARS_FOR_INPUTS)}
            inputWrapperOrder={['label', 'error', 'input', 'description']}
            {...form.getInputProps('comment')}
        />
    )

    const scoreInput = () => (
        <NumberInput
            disabled={isReviewComplete}
            label={"Review Score: "}
            {...form.getInputProps('score')}
        />
    )

    const technicalFeasibilityInput = () => (
        <Switch
            disabled={isReviewComplete}
            label={"technically feasible?"}
            size={"md"}
            onLabel={"YES"}
            offLabel={"NO"}
            {...form.getInputProps('technicalFeasibility',
                {type: 'checkbox'})}
        />
    )

    type AssignButtonData = {
        reviewerId: number,
        proposalId: number,
        proposalTitle?: string
    }

    const handleAssign = (buttonProps: AssignButtonData) =>  {
        fetchProposalReviewResourceAddReview({
            pathParams: {
                cycleCode: Number(props.cycleCode),
                submittedProposalId: props.proposal?._id!
            },
            // A "blank" review
            body: {
                comment: "",
                score: 0,
                technicalFeasibility: false,
                reviewer: {
                    _id: buttonProps.reviewerId
                }
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess("Assigment Successful",
                "You have self-assigned " + " to '" + buttonProps.proposalTitle + "'"))
            .catch(error => notifyError("Failed to self-assign " + " to " +
                "'" + buttonProps.proposalTitle  + "'",
                getErrorMessage(error)))
    }

    //use async and await so that any multiple "fetch" commands are done in sequence
    async function handleSubmit (values: typeof form.values) {
        // a "blank" review is created when a reviewer is assigned to the proposal meaning
        // we are only ever updating fields rather than creating objects

        //if here, at least one of the following conditions must be true

        if (form.isDirty('comment')) {
            //update comment
           await fetchProposalReviewResourceUpdateReviewComment({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposal?._id!,
                    reviewId: theReview?._id!
                },
                body: values.comment,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
               .then(() => notifySuccess("Success",
                    "Review comment has been updated"))
               .catch(error => notifyError("Failed to update comment",
                    getErrorMessage(error)))
        }

        if (form.isDirty('score')) {
            //update score
           await fetchProposalReviewResourceUpdateReviewScore({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposal?._id!,
                    reviewId: theReview?._id!
                },
                body: values.score,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
               .then(() => notifySuccess("Success",
                    "Review score has been updated"))
               .catch(error => notifyError("Failed to update score",
                    getErrorMessage(error)))
        }

        if (form.isDirty('technicalFeasibility')) {
            //update technicalFeasibility
           await fetchProposalReviewResourceUpdateReviewFeasibility({
                pathParams: {
                    cycleCode: props.cycleCode,
                    submittedProposalId: props.proposal?._id!,
                    reviewId: theReview?._id!
                },
                //I may be going mad. The api will not accept false (boolean value) with a
                //'No-content' exception, but will accept "false" (literal string); no such
                //problem with true
                body: values.technicalFeasibility ? true : "false",
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
               .then(() => notifySuccess("Success",
                    "Review feasibility has been updated"))
               .catch(error => notifyError("Failed to update feasibility",
                    getErrorMessage(error)))
        }

        form.resetDirty();
    }

    const handleCompletion = () => {
        fetchProposalReviewResourceConfirmReviewComplete({
            pathParams: {
                cycleCode: props.cycleCode,
                submittedProposalId: props.proposal?._id!,
                reviewId: theReview?._id!
            }
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => notifySuccess("Success",
                "This review is now complete"))
            .catch(error => notifyError("Failed to Complete",
                getErrorMessage(error)))
    }

    const confirmCompletion = () => {
        modals.openConfirmModal({
            title: "Confirm completion of this review",
            centered: true,
            children: (
                <Text size={"sm"} c={"orange"}>
                    This will finalise the review. It's completion date will be set
                    to today's date, and no further edits to the review are allowed.
                    Are you sure you want to complete this review?
                </Text>
            ),
            labels: {confirm: "Complete", cancel: "No, do not complete"},
            confirmProps: {color: "orange"},
            onConfirm: () => handleCompletion()
        })
    }

    let reviewCompleteDate = new Date(theReview?.reviewDate!);
    let isReviewComplete: boolean = reviewCompleteDate.getTime() > 0;

    return (
        <>
            {
                theReview ?
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        You are reviewing as {theReviewer.data?.person?.fullName}
                        <Grid columns={10} gutter={"xl"}>
                            <Grid.Col span={7}>
                                {commentInput()}
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Stack>
                                    {scoreInput()}
                                    {technicalFeasibilityInput()}
                                </Stack>
                            </Grid.Col>
                        </Grid>

                            {
                                isReviewComplete ?
                                    <Group justify={"center"}>
                                        <Badge color={"green"} radius={"sm"}>
                                            Review Completed on {reviewCompleteDate.toDateString()}
                                        </Badge>
                                    </Group>
                                    :
                                    <Group justify={"flex-end"} >
                                        <SubmitButton
                                            toolTipLabel={"Save changes"}
                                            label={"Update"}
                                            disabled={!form.isDirty() || !form.isValid()}
                                        />
                                        <Tooltip
                                            label={"Finalises this review"}
                                            openDelay={OPEN_DELAY}
                                            closeDelay={CLOSE_DELAY}
                                        >
                                            <Button
                                                rightSection={<IconSquareRoundedCheck size={ICON_SIZE}/>}
                                                color={"orange"}
                                                variant={"outline"}
                                                onClick={confirmCompletion}
                                            >
                                                Complete Review
                                            </Button>
                                        </Tooltip>
                                    </Group>
                            }
                    </form>
                    :
                    <Stack align={"center"}>
                        <Text size={"sm"} c={"gray.5"}>
                            You are currently not assigned to review '{props.proposal?.proposal?.title}'.
                            If you wish to review this proposal please click on the "Self-Assign" button.
                        </Text>
                        <AddButton
                            toolTipLabel={"Assign yourself as a Reviewer"}
                            label={"Self-Assign"}
                            onClick={()=>handleAssign(
                                {
                                    reviewerId: props.reviewerId,
                                    proposalId: props.proposal?._id!,
                                    proposalTitle: props?.proposal?.proposal?.title!
                                }
                            )}
                        />
                    </Stack>
            }
        </>

    )
}