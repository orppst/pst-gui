import {ReactElement, useContext} from "react";
import {Loader} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ProposalContext} from "../../App2.tsx";
import {
    useReviewerResourceGetReviewers
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ReviewsAccordion from "./reviews.accordion.tsx";
import {SubmittedProposal} from "../../generated/proposalToolSchemas.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";

export type ReviewsProps = {
    reviewerId: number,
    cycleCode: number,
    proposal?: SubmittedProposal
    reviewsLocked?: boolean
}

//we assume access to this page is restricted to users assigned with the 'reviewer' role

export default
function ReviewsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    const {user} = useContext(ProposalContext);


    const reviewers =
        useReviewerResourceGetReviewers({})

    if (reviewers.isLoading) {
        return (<Loader/>)
    }

    if (reviewers.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load reviewers"}
                error={getErrorMessage(reviewers.error)}
            />
        )
    }


    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Reviews"}
            />
            <ReviewsAccordion
                reviewerId={user._id!}
                cycleCode={Number(selectedCycleCode)}
            />
        </PanelFrame>
    )
}