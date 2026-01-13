import {ReactElement, useContext} from "react";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ProposalContext, useToken} from "../../App2.tsx";
import {
    fetchProposalCyclesResourceExcelReviews, useProposalCyclesResourceGetProposalCycleDetails,
    useReviewerResourceGetReviewers, useSubmittedProposalResourceGetAssignedSubmittedProposals,
    useSubmittedProposalResourceGetSubmittedNotYetAllocated
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SubmittedProposal} from "../../generated/proposalToolSchemas.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";
import {ExportButton} from "../../commonButtons/export.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {Alert, Container, Fieldset, Flex, Loader, Stack} from "@mantine/core";
import ReviewsAssignedTable from "./reviews.assigned.table.tsx";
import ReviewsNotAssignedTable from "./reviews.notAssigned.table.tsx";

export type ReviewsProps = {
    reviewerId: number,
    cycleCode: number,
    proposal?: SubmittedProposal
    reviewsLocked?: boolean
}

//we assume this function has been called from a context that checks the "reviewer" status of the user

export default
function ReviewsPanel() : ReactElement {
    const {user} = useContext(ProposalContext);

    const {selectedCycleCode} = useParams();

    const authToken = useToken();

    const reviewers =
        useReviewerResourceGetReviewers({})

    const cycleDetails =
        useProposalCyclesResourceGetProposalCycleDetails({pathParams: {cycleCode: Number(selectedCycleCode)}})

    const allProposals =
        useSubmittedProposalResourceGetSubmittedNotYetAllocated({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    const assigned =
        useSubmittedProposalResourceGetAssignedSubmittedProposals({
            pathParams: {cycleCode: Number(selectedCycleCode), personId: user._id!}
        })

    if (allProposals.isLoading || assigned.isLoading || reviewers.isLoading) {
        return (<Loader />)
    }

    if (allProposals.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load all Submitted Proposal"}
                error={getErrorMessage(allProposals.error)}
            />
        )
    }

    if (assigned.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load assigned Submitted Proposal"}
                error={getErrorMessage(assigned.error)}
            />
        )
    }

    if (reviewers.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load reviewers"}
                error={getErrorMessage(reviewers.error)}
            />
        )
    }

    if (allProposals.data?.length === 0) {
        return (
            <Container size={"50%"} mt={100}>
                <Alert
                    variant={"light"}
                    title={"No outstanding Submitted Proposals"}
                    color={"green"}
                >
                    There are no available submitted proposals to review
                </Alert>
            </Container>
        )
    }

    const reviewerId = reviewers.data?.find(
        reviewer => reviewer.code === String(user._id))!.dbid!

    const notAssigned = allProposals.data?.filter(all =>
        !assigned.data?.find(assigned => assigned.dbid === all.dbid)
    )

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
            {HaveRole(["tac_admin"]) &&
                <Flex justify={"center"}>
                    <ExportButton
                        toolTipLabel={"Export to a file for download"}
                        disabled={false}
                        onClick={handleDownloadReviews}
                        label={"Export Review Scores"}
                        variant={"filled"}
                        toolTipLabelPosition={"top"}
                    />
                </Flex>
            }
            <Stack>
                <Fieldset legend={"Assigned Proposals to review"}>
                    {
                        assigned.data && assigned.data?.length > 0 &&
                        <ReviewsAssignedTable
                            cycleCode={Number(selectedCycleCode)}
                            assigned={assigned.data}
                        />
                    }
                </Fieldset>
                <Fieldset legend={"Proposals that are not assigned to you"}>
                    {
                        notAssigned && notAssigned.length > 0 ?
                            <ReviewsNotAssignedTable
                                cycleCode={Number(selectedCycleCode)}
                                reviewerId={reviewerId}
                                notAssigned={notAssigned}
                            />
                            :
                            <Alert title={"You're Popular!"}>
                                You have been assigned to all Submitted Proposals in this Cycle
                            </Alert>

                    }
                </Fieldset>
            </Stack>
        </PanelFrame>
    )
}