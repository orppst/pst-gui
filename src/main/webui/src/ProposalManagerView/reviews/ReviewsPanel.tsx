import {ReactElement, useContext, useEffect, useState} from "react";
import {Alert, Container, Loader} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ProposalContext} from "../../App2.tsx";
import {
    useReviewerResourceGetReviewers
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {IconInfoCircle} from "@tabler/icons-react";
import ReviewsAccordion from "./reviews.accordion.tsx";
import {SubmittedProposal} from "../../generated/proposalToolSchemas.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";

export type ReviewsProps = {
    reviewerId: number,
    cycleCode: number,
    proposal?: SubmittedProposal
}

export default
function ReviewsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    const {user} = useContext(ProposalContext);

    const [reviewerId, setReviewerId] = useState(0)

    const reviewers =
        useReviewerResourceGetReviewers({})

    useEffect(() => {
        if (reviewers.status === 'success') {
            //although unlikely, names are potentially NOT unique
            let reviewer =
                reviewers.data.find(rev => rev.name == user.fullName);
            if (reviewer) {
                setReviewerId(reviewer.dbid!)
            } //else do nothing
        }
    }, [reviewers.status]);

    const alertNotReviewer = () => (
        <Container size={"50%"} mt={"100"}>
            <Alert
                variant={"light"}
                color={"blue"}
                title={"Reviewers Only"}
                icon={<IconInfoCircle/>}
            >
                You must be a TAC member to review proposals
            </Alert>
        </Container>
    )

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
            {
                reviewerId != 0 ?
                    <ReviewsAccordion
                        reviewerId={reviewerId}
                        cycleCode={Number(selectedCycleCode)}
                    />
                    :
                    alertNotReviewer()
            }
        </PanelFrame>
    )
}