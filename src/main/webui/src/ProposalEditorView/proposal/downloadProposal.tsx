import { ObservingProposal } from 'src/generated/proposalToolSchemas.ts';
import {
    fetchProposalResourceExportProposalZip,
} from 'src/generated/proposalToolComponents.ts';
import {notifyError, notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


/**
 * handles all the processing for downloading a proposal into a tarball.
 *
 * @param {ObservingProposal} proposalData the proposal data.
 * @param authToken the authorization token required for 'fetch' type calls
 */
function downloadProposal(
        proposalData:  ObservingProposal,
        authToken: string
): void {

    if(proposalData === undefined || proposalData === null || proposalData._id === undefined) {
        notifyError("Export Proposal", "Unable to find a proposal");
        return;
    }

    notifyInfo("Proposal Export Started",
        "An export has started and the download will begin shortly");

    fetchProposalResourceExportProposalZip({
        pathParams: {proposalCode: proposalData._id},
        headers: {authorization: `Bearer ${authToken}`}
    }).then((zipData) => {
        // Create a download link for the zip file
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(zipData as unknown as Blob);
        link.download="Export."
            +proposalData.title?.replace(/\s/g,"").substring(0,31)+".zip";
        link.click();
    })
    .then(()=>
        notifySuccess("Proposal Export Complete", "proposal exported and downloaded")
    )
    .catch((error:Error) =>
        notifyError("Proposal Export Failed", getErrorMessage(error))
    )
}

// main entrance function is the download proposal function.
export default downloadProposal