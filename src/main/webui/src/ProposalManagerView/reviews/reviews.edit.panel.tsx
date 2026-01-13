import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {
    useProposalResourceGetObservingProposalTitle,
    useProposalReviewResourceGetReview
} from "../../generated/proposalToolComponents.ts";
import {Loader} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ReviewsForm from "./reviews.form.tsx";

export default
function ReviewsEditPanel(): ReactElement {

    const {selectedCycleCode, proposalId, reviewerId, reviewId} = useParams();

    const theReview = useProposalReviewResourceGetReview({
        pathParams: {
            cycleCode: Number(selectedCycleCode),
            submittedProposalId: Number(proposalId),
            reviewId: Number(reviewId)
        }
    })

    const proposalTitle = useProposalResourceGetObservingProposalTitle({
        pathParams: {proposalCode: Number(proposalId)}
    })

    if (theReview.isLoading || proposalTitle.isLoading) {
        return (
            <Loader/>
        )
    }

    if (proposalTitle.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load proposal title"}
                error={getErrorMessage(proposalTitle.error)}
            />
        )
    }

    if (theReview.isError) {
        return (
            <AlertErrorMessage
                title={"Unable to load the review"}
                error={getErrorMessage(theReview.error)}
            />
        )
    }
    
    if (theReview.data?.reviewer?._id !== Number(reviewerId)) {
        return (
            <AlertErrorMessage
                title={"Imposter detected"}
                error={"You are not the registered reviewer of this review"}
            />
        )
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Edit Review for '" + proposalTitle + "'"}
            />
            <ReviewsForm
                cycleCode={Number(selectedCycleCode)}
                proposalId={Number(proposalId)}
                theReview={theReview.data}
            />

        </PanelFrame>
    )
}