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
import { JSON_FILE_NAME, OVERVIEW_PDF_FILENAME } from 'src/constants.tsx';
import {notifyError, notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


/**
 * generates a blob for the overview page that contains the pdf.
 *
 * @param {HTMLInputElement} element the top page to turn into a pdf blob.
 * @return {Promise<Blob>} the blob of the pdf.
 */
const generatePdf = async (element: HTMLInputElement): Promise<Blob> => {
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
const populateSupportingDocuments = (
    zip: JSZip,
    supportingDocumentData: ObjectIdentifier[],
    selectedProposalCode: String,
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
 * handles all the processing for downloading a proposal into a tarball.
 *
 * @param {HTMLInputElement} element the overview page to print as a pdf.
 * @param {ObservingProposal} proposalData the proposal data.
 * @param { SupportingDocumentResourceGetSupportingDocumentsResponse} supportingDocumentData the data for supporting documents.
 * @param {string} selectedProposalCode the selected proposal code.
 * @param authToken the authorization token required for 'fetch' type calls
 */
function downloadProposal(
        element: HTMLInputElement,
        proposalData:  ObservingProposal,
        supportingDocumentData: ObjectIdentifier[],
        selectedProposalCode: String,
        authToken: string
): void {

    notifyInfo("Proposal Export Started",
        "An export has started and the download will begin shortly");

    // get pdf data.
    const pdfData = generatePdf(element);

    // build the zip object and populate with the corresponding documents.
    let zip = new JSZip();
    zip = zip.file(OVERVIEW_PDF_FILENAME, pdfData);

    // add supporting documents to the zip.
    const promises = populateSupportingDocuments(
        zip, supportingDocumentData, selectedProposalCode, authToken
    );

    promises.push(
        fetchProposalResourceExportProposal({
            headers: {authorization: `Bearer ${authToken}`},
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            }
        })
            .then((blob)=> {
                zip.file(JSON_FILE_NAME, blob!)
            })
            .catch((error)=>
                notifyError("Export Error", getErrorMessage(error))
            )
    );

    // ensure all supporting docs populated before making zip.
    Promise.all(promises).then(
        () => {
            // generate the zip file.
            zip.generateAsync({type: "blob"})
                .then((zipData: Blob | MediaSource) => {
                    // Create a download link for the zip file
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(zipData);
                    link.download=proposalData.title?.replace(/\s/g,"").substring(0,31)+".zip";
                    link.click();
                })
                .then(()=>
                    notifySuccess("Proposal Export Complete", "proposal exported and downloaded")
                )
                .catch((error:Error) =>
                    notifyError("Proposal Export Failed", getErrorMessage(error))
                )
        }
    )
}

// main entrance function is the download proposal function.
export default downloadProposal