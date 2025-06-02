import { ObjectIdentifier, ObservingProposal } from 'src/generated/proposalToolSchemas.ts';
import html2canvas from 'html2canvas';
// renamed to bypass ESlint issues about constructors needing to be capital letters.
import { jsPDF as JSPDF } from 'jspdf';
// used the import * as it bypasses a fault with how this is meant to be imported.
import * as JSZip from 'jszip';
import {
    fetchProposalResourceExportProposal,
    fetchSupportingDocumentResourceDownloadSupportingDocument
} from 'src/generated/proposalToolComponents.ts';
import {OPTICAL_FOLDER_NAME, POLARIS_MODES} from 'src/constants.tsx';
import {notifyError, notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {
    fetchOpticalTelescopeResourceGetProposalObservationIds,
    fetchOpticalTelescopeResourceLoadTelescopeData, SaveTelescopeState
} from "../../util/telescopeComms";
import {handleSingleProposal} from "../../ProposalManagerView/proposalCycle/downloadProposals";
import {NavigateFunction} from "react-router-dom";
import {QueryClient} from "@tanstack/react-query";


/**
 * generates a blob for the overview page that contains the pdf.
 *
 * @param {HTMLInputElement} element the top page to turn into a pdf blob.
 * @return {Promise<Blob>} the blob of the pdf.
 */
export const generatePdf = async (element: HTMLInputElement): Promise<Blob> => {
    // convert overview to png in a pdf.
    const canvas = await html2canvas(element);
    const pdfMargin = 2;

    const pdfGenerator = new JSPDF();
    // noinspection JSUnresolvedReference
    const imgProperties =
        pdfGenerator.getImageProperties(canvas);
    // noinspection JSUnresolvedReference
    const pdfWidth =
        pdfGenerator.internal.pageSize.getWidth() - 2 * pdfMargin;
    const pdfHeight =
        (imgProperties.height * pdfWidth) /
        imgProperties.width - 2 * pdfMargin;
    // noinspection JSUnresolvedReference
    pdfGenerator.addImage(
        canvas, 'PNG',
        pdfMargin, pdfMargin,
        pdfWidth, pdfHeight,
        undefined, "SLOW");

    // get pdf data.
    return pdfGenerator.output('blob');
}

/**
 * goes through the proposals supporting documents and adds them to the zip.
 * @param {JSZip} zip the zip object.
 * @param supportingDocumentData the data for supporting documents.
 * @param selectedProposalCode the selected proposal code.
 * @param authToken the authorization token required for 'fetch' type calls
 */
export const populateSupportingDocuments = (
    zip: JSZip,
    supportingDocumentData: ObjectIdentifier[],
    selectedProposalCode: string,
    authToken: string
): Array<Promise<void>> => {
        return supportingDocumentData.map(async (item: ObjectIdentifier) => {
            if (item.dbid !== undefined && item.name !== undefined) {
                // have to destructure this, as otherwise risk of being undefined
                // detected later.
                let docTitle = item.name;

                // ensure that if the file exists already, that it's renamed to
                // avoid issues of overwriting itself in the zip.
                while (zip.files[docTitle]) {
                    docTitle = docTitle + "1"
                }

                // extract the document and save into the zip.
                await fetchSupportingDocumentResourceDownloadSupportingDocument({
                    headers: {authorization: `Bearer ${authToken}`},
                    pathParams: {
                        proposalCode: Number(selectedProposalCode),
                        id: item.dbid
                    }
                })
                    .then((blob) => {
                        // ensure we got some data back.
                        if (blob !== undefined) {
                            zip.file(docTitle, blob)
                        }
                    })
            }
        });
    }

/**
 * extracts telescope data.
 *
 * @param selectedProposalCode the proposal code
 * @param promises the list of promises needed to be resolved before zipping.
 * @param zip the zip.
 */
export function extractTelescope(
        selectedProposalCode: string, promises:  Promise<void>[], zip: JSZip):
        Promise<void> {
    return fetchOpticalTelescopeResourceGetProposalObservationIds({
        proposalID: selectedProposalCode
    })
        .then((observationIds: number []) => {
            observationIds.map((observationId: number) => {
                promises.push(
                    fetchOpticalTelescopeResourceLoadTelescopeData({
                        proposalID: selectedProposalCode,
                        observationID: observationId.toString()
                    })
                        .then((data: SaveTelescopeState) => {
                            zip.file(
                                `${OPTICAL_FOLDER_NAME}/obs_${observationId}.json`,
                                JSON.stringify(data))
                        })
                )
            })
        })
}


/**
 * handles all the processing for downloading a proposal into a tarball.
 *
 * @param proposalData the proposal data.
 * @param authToken the authorization token required for 'fetch' type calls
 * @param forceUpdate the force update function.
 * @param navigate the navigate function.
 * @param queryClient the query client function.
 * @param polarisMode the mode polaris is operating in right now.
 */
async function downloadProposal(
    proposalData: ObservingProposal,
    authToken: string,
    forceUpdate: () => void,
    navigate: NavigateFunction,
    queryClient: QueryClient,
    polarisMode: POLARIS_MODES,
): Promise<void> {

    notifyInfo("Proposal Export Started",
        "An export has started and the download will begin shortly");

    const proposalJSONPromise = fetchProposalResourceExportProposal({
        headers: {authorization: `Bearer ${authToken}`},
        pathParams: {
            proposalCode: Number(proposalData._id),
            investigatorsIncluded: true
        }
    });

    handleSingleProposal({
        forceUpdate, authToken, navigate, queryClient, polarisMode,
        proposalDataPromise:Promise.resolve(proposalData),
        proposalJSONPromise: proposalJSONPromise,
        proposalID:proposalData._id!.toString(),
        proposalTitle:proposalData.title!,
        showInvestigators: true,
    }).then(innerZip => {
        if (innerZip) {
            // generate the zip file.
            innerZip.generateAsync({type: "blob"})
                .then((zipData: Blob | MediaSource) => {
                    // Create a download link for the zip file
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(zipData);
                    link.download = proposalData.title?.replace(
                        /\s/g, "").substring(0, 31) + ".zip";
                    link.click();
                })
                .then(() =>
                    notifySuccess(
                        "Proposal Export Complete", "proposal exported" +
                        " and downloaded")
                )
                .catch((error: Error) =>
                    notifyError(
                        "Proposal Export Failed", getErrorMessage(error))
                )
            }
        }
    );
}

// main entrance function is the download proposal function.
export default downloadProposal