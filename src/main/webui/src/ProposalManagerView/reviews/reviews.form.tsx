import {ReactElement} from "react";
import {Button, Grid, Group, NumberInput, Space, Stack, Switch, Text, Textarea, Tooltip} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
import {ReviewsProps} from "./ReviewsPanel.tsx";
import {
    fetchJustificationsResourceDownloadReviewerZip,
    fetchProposalReviewResourceUpdateReviewComment,
    fetchProposalReviewResourceUpdateReviewFeasibility,
    fetchProposalReviewResourceUpdateReviewScore,
    useProposalReviewResourceAddReview,
    useProposalReviewResourceConfirmReviewComplete,
    useReviewerResourceGetReviewer
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useForm} from "@mantine/form";
import {
    CLOSE_DELAY,
    ICON_SIZE,
    MAX_CHARS_FOR_REVIEW,
    OPEN_DELAY,
} from "../../constants.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {IconSquareRoundedCheck} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import {useToken} from "../../App2.tsx";
import {useMediaQuery} from "@mantine/hooks";
import {ExportButton} from "../../commonButtons/export.tsx";

export default
function ReviewsForm(props: ReviewsProps) : ReactElement {

    const commentLengthZeroMsg =
        "You must update this review with at least a comment before you can submit"

    const saveChangesSubmit = "Changes must be saved before you can submit this review"

    const alreadySubmitted = "this review is submitted"

    const authToken = useToken();

    const queryClient = useQueryClient();

    const smallScreen = useMediaQuery("(max-width: 1350px)");

    const addReview =
        useProposalReviewResourceAddReview();

    const confirmReview =
        useProposalReviewResourceConfirmReviewComplete()

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
            comment: theReview?.comment ?? "",
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
            label={"Please provide your comments:"}
            rows={10}
            maxLength={MAX_CHARS_FOR_REVIEW}
            description={
                MAX_CHARS_FOR_REVIEW -
                form.values.comment.length +
                "/" + String(MAX_CHARS_FOR_REVIEW)}
            inputWrapperOrder={['label', 'error', 'input', 'description']}
            disabled={props.reviewsLocked}
            {...form.getInputProps('comment')}
        />
    )

    const scoreInput = () => (
        <NumberInput
            label={"Review Score: "}
            hideControls
            disabled={props.reviewsLocked}
            {...form.getInputProps('score')}
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
            {...form.getInputProps('technicalFeasibility',
                {type: 'checkbox'})}
        />
    )

    const reviewSubmitButton = () => (
        <Tooltip
            label={props.reviewsLocked ? "Reviews locked" :
                theReview?.comment?.length === 0 ? commentLengthZeroMsg :
                    form.isDirty() ? saveChangesSubmit :
                        new Date(theReview?.reviewDate!).getTime() > 0 ? alreadySubmitted :
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
                disabled={form.isDirty() ||
                    theReview?.comment?.length == 0 ||
                    new Date(theReview?.reviewDate!).getTime() > 0 ||
                    props.reviewsLocked}
            >
                Submit
            </Button>
        </Tooltip>
    )

    type AssignButtonData = {
        reviewerId: number,
        proposalId: number,
        proposalTitle?: string
    }

    const handleAssign = (buttonProps: AssignButtonData) =>  {
        addReview.mutate({
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
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() =>
                        notifySuccess("Assigment Successful",
                        "You have self-assigned " + " to '" + buttonProps.proposalTitle + "'")
                    )
            },
            onError: (error) =>
                notifyError("Failed to self-assign " + " to " +
                    "'" + buttonProps.proposalTitle  + "'", getErrorMessage(error))

        })
    }

    /*
        Dev idea: Make the review comment and review score save on change after a delay, and the
        technical feasibility switch save on change, no delay - then we don't need to use
        async-await semantics and mutations can be used.
     */


    // We cannot change these fetch calls to mutations as we are using async-await semantics to
    // ensure multiple changes actually occur. To authenticate these fetches we must use the
    // bearer token from context.

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
                headers: {
                    authorization: `Bearer ${authToken}`,
                    // @ts-ignore
                    "Content-Type": "text/plain"
                }
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
               headers: {
                   authorization: `Bearer ${authToken}`,
                   // @ts-ignore
                   "Content-Type": "text/plain"
               }
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
               headers: {
                   authorization: `Bearer ${authToken}`,
                   // @ts-ignore
                   "Content-Type": "text/plain"
               }
            })
               .then(() => notifySuccess("Success",
                    "Review feasibility has been updated"))
               .catch(error => notifyError("Failed to update feasibility",
                    getErrorMessage(error)))
        }

        await queryClient.invalidateQueries()

        //needed to ensure the Update button is disabled after a successful update
        form.resetDirty();
    }

    const handleCompletion = () => {
        confirmReview.mutate({
            pathParams: {
                cycleCode: props.cycleCode,
                submittedProposalId: props.proposal?._id!,
                reviewId: theReview?._id!
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() =>
                        notifySuccess("Success", "This review has been submitted"))
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
            pathParams: {proposalCode: props.proposal?._id!},
            headers: {authorization: `Bearer ${authToken}`}
        })
            .then((reviewPDF) => {
                if (reviewPDF) {
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(reviewPDF);
                    link.download = props.proposal?.proposalCode + " "
                        + props.proposal?.title?.replace(/\s/g, "")
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
        <>
            {theReview ?
                <form onSubmit={form.onSubmit(handleSubmit)}>
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
                                    <SubmitButton
                                        toolTipLabel={!form.isValid() ? "Ensure all fields are filled in" :
                                            props.reviewsLocked ? "Reviews locked" : "Save changes"}
                                        label={"Update"}
                                        disabled={!form.isDirty() || !form.isValid() || props.reviewsLocked}
                                    />
                                    {reviewSubmitButton()}
                                </Group>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </form>
                :
                props.reviewsLocked ?
                    <Text size={"sm"} c={"orange"}>
                        You cannot provide a review for this proposal as the reviews have been locked.
                    </Text>
                    :
                    <Stack align={"center"}>
                        <Text size={"sm"} c={"gray.5"}>
                            You are currently not assigned to review '{props.proposal?.title}'.
                            If you wish to review this proposal please click on the "Self-Assign" button.
                        </Text>
                        <AddButton
                            toolTipLabel={"Assign yourself as a Reviewer"}
                            label={"Self-Assign"}
                            onClick={()=>handleAssign(
                                {
                                    reviewerId: props.reviewerId,
                                    proposalId: props.proposal?._id!,
                                    proposalTitle: props?.proposal?.title!
                                }
                            )}
                        />
                    </Stack>
            }
        </>
    )
}