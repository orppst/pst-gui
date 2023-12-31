import { ObjectIdentifier, ObservingProposal } from '../generated/proposalToolSchemas.ts';
import html2canvas from 'html2canvas';
// renamed to bypass ESlint issues about constructors needing to be capital letters.
import { jsPDF as JSPDF } from 'jspdf';
// used the import * as it bypasses a fault with how this is meant to be imported.
import * as JSZip from 'jszip';
import {
    fetchSupportingDocumentResourceDownloadSupportingDocument,
    SupportingDocumentResourceGetSupportingDocumentsResponse,
} from '../generated/proposalToolComponents.ts';

/**
 * generates a blob for the overview page that contains the pdf.
 *
 * @param {HTMLInputElement} element the top page to turn into a pdf blob.
 * @return {Promise<Blob>} the blob of the pdf.
 */
const generatePdf = async (element: HTMLInputElement): Promise<Blob> => {
    // convert overview to png.
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');

    // convert png to pdf.
    const pdfGenerator = new JSPDF();
    // noinspection JSUnresolvedReference
    const imgProperties =
        pdfGenerator.getImageProperties(data);
    // noinspection JSUnresolvedReference
    const pdfWidth =
        pdfGenerator.internal.pageSize.getWidth();
    const pdfHeight =
        (imgProperties.height * pdfWidth) /
        imgProperties.width;
    // noinspection JSUnresolvedReference
    pdfGenerator.addImage(
        data, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // get pdf data.
    return pdfGenerator.output('blob');
}

/**
 * goes through the proposals supporting documents and adds them to the zip.
 * @param {JSZip} zip the zip object.
 * @param supportingDocumentData the data for supporting documents.
 * @param selectedProposalCode the selected proposal code.
 */
const populateSupportingDocuments = (
    zip: JSZip,
    supportingDocumentData: SupportingDocumentResourceGetSupportingDocumentsResponse,
    selectedProposalCode: String):
    Array<Promise<void>> => {
    return supportingDocumentData.map(async (item: ObjectIdentifier) => {
        if (item.dbid !== undefined && item.name !== undefined) {
            // have to destructure this, as otherwise risk of being undefined
            // detected later.
            const docTitle = item.name;
            await fetchSupportingDocumentResourceDownloadSupportingDocument(
                { pathParams: {
                    id: item.dbid,
                        proposalCode: Number(selectedProposalCode) } })
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
 */
async function downloadProposal(
        element: HTMLInputElement,
        proposalData:  ObservingProposal,
        supportingDocumentData: SupportingDocumentResourceGetSupportingDocumentsResponse,
        selectedProposalCode: String):
    Promise<void> {

    // determine correct title for the pdf.
    let title = 'UnNamedProposal.pdf';
    if (proposalData?.title) {
        title = `${proposalData.title}.pdf`;
    }

    // get pdf data.
    const pdfData = generatePdf(element);

    // build the zip object and populate with the corresponding documents.
    let zip = new JSZip();
    zip = zip.file(title, pdfData);

    // add supporting documents to the zip.
    const promises = populateSupportingDocuments(
        zip, supportingDocumentData, selectedProposalCode
    );

    // ensure all supporting docs populated before making zip.
    Promise.all(promises).then(
        () => {
            //logging for safety.
            console.debug(`The zip currently contains the following docs:`);
            console.debug(zip.files);

            // generate the zip file.
            zip.generateAsync({type: "blob"}).then((zipData: Blob | MediaSource) => {
                // Create a download link for the zip file
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(zipData);
                link.download = "proposal.zip";
                link.click();
            })
        }
    )
}

// main entrance function is the download proposal function.
export default downloadProposal