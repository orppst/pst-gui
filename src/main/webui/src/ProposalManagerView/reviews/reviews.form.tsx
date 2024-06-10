import {ReactElement} from "react";
import {Grid, Group, NumberInput, Stack, Switch, Text, Textarea} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
import {ReviewsProps} from "./ReviewsPanel.tsx";
import {
    fetchProposalReviewResourceAddReview,
    useReviewerResourceGetReviewer
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useForm} from "@mantine/form";
import {MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS} from "../../constants.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";

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
        }
    })

    if (theReviewer.error) {
        notifyError("Failed to load the reviewer", getErrorMessage(theReviewer.error))
    }

    const commentInput = () => (
        <>
            <Textarea
                label={"Please provide your comments:"}
                rows={TEXTAREA_MAX_ROWS}
                maxLength={MAX_CHARS_FOR_INPUTS}
                description={
                    MAX_CHARS_FOR_INPUTS -
                    form.values.comment.length +
                    "/" + String(MAX_CHARS_FOR_INPUTS)}
                inputWrapperOrder={['label', 'error', 'input', 'description']}
                name="summary" {...form.getInputProps('comment')}
            />
        </>
    )

    const scoreInput = () => (
        <NumberInput
            label={"Review Score: "}
            {...form.getInputProps('score')}
        />
    )

    const technicalFeasibilityInput = () => (
        <Switch
            label={"Technical Feasibility"}
            size={"md"}
            onLabel={"YES"}
            offLabel={"NO"}
            {...form.getInputProps('technicalFeasibility')}
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

    const handleSubmit = form.onSubmit(values => console.log(values))

    return (
        <>
            {
                theReview ?
                    <form onSubmit={handleSubmit}>
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
                        <Group justify={"flex-end"} >
                            <SubmitButton toolTipLabel={"Save changes"}/>
                        </Group>
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