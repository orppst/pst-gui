import {ReactElement, useContext, useEffect, useState} from "react";
import {Alert, Container} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ProposalContext} from "../../App2.tsx";
import {fetchReviewerResourceGetReviewers} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {IconInfoCircle} from "@tabler/icons-react";
import ReviewsAccordion from "./reviews.accordion.tsx";
import {SubmittedProposal} from "../../generated/proposalToolSchemas.ts";

export type ReviewsProps = {
    reviewerId: number,
    cycleCode: number,
    proposal?: SubmittedProposal
}

export default
function ReviewsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    const { user} = useContext(ProposalContext);

    const [reviewerId, setReviewerId] = useState(0)

    useEffect(() => {
        fetchReviewerResourceGetReviewers({})
            .then(data => {
                //may want to check a guaranteed unique value here, rather than the name
                let reviewer =
                    data.find(rev => rev.name == user.fullName);
                if (reviewer) {
                    setReviewerId(reviewer.dbid!)
                } //else do nothing
            })
            .catch(error => notifyError("Failed to load Reviewers",
                getErrorMessage(error)))
    }, []);

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