import {ReactElement, useContext, useEffect, useState} from "react";
import {Alert, Container, Loader} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ProposalContext, useToken} from "../../App2.tsx";
import {
    fetchProposalCyclesResourceExcelReviews, useProposalCyclesResourceGetProposalCycleDetails,
    useReviewerResourceGetReviewers
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {IconInfoCircle} from "@tabler/icons-react";
import ReviewsAccordion from "./reviews.accordion.tsx";
import {SubmittedProposal} from "../../generated/proposalToolSchemas.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";
import {ExportButton} from "../../commonButtons/export.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";

export type ReviewsProps = {
    reviewerId: number,
    cycleCode: number,
    proposal?: SubmittedProposal
    reviewsLocked?: boolean
}

export default
function ReviewsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    const authToken = useToken();

    const {user} = useContext(ProposalContext);

    const [reviewerId, setReviewerId] = useState(0)

    const reviewers =
        useReviewerResourceGetReviewers({})

    const cycleDetails =
        useProposalCyclesResourceGetProposalCycleDetails({pathParams: {cycleCode: Number(selectedCycleCode)}})

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

    const handleDownloadReviews = (): void => {
        fetchProposalCyclesResourceExcelReviews({pathParams: {cycleCode: Number(selectedCycleCode)},
            headers: {authorization: `Bearer ${authToken}`}
        }).then((zipData) => {
            // Create a download link for the zip file
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(zipData as unknown as Blob);
            link.download="Reviews." + cycleDetails.data?.code + ".xlsx";
            link.click();
        })
            .then(()=>
                notifySuccess("Export Complete", "review scores exported and downloaded")
            )
            .catch((error:Error) =>
                notifyError("Export Failed", getErrorMessage(error))
            )
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Reviews"}
            />
            {HaveRole(["tac_admin"]) && (
                <ExportButton
                        toolTipLabel={"Export to a file for download"}
                        disabled={false}
                        onClick={handleDownloadReviews}
                        label={"Export Review Scores"}
                        variant={"filled"}
                        toolTipLabelPosition={"top"}
                    />)
            }
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