import { ObservingProposal } from '../generated/proposalToolSchemas.ts';
import html2canvas from 'html2canvas';
// renamed to bypass ESlint issues about constructors needing to be capital letters.
import { jsPDF as JSPDF } from 'jspdf';
import { ZipArchive } from "@shortercode/webzip";
import * as JSZip from "jszip";

/**
 * handles all the processing for downloading a proposal into a tarball.
 *
 * @param {HTMLInputElement} element the overview page to print as a pdf.
 * @param {ObservingProposal} proposalData the proposal data.
 */
async function downloadProposal(
        element: HTMLInputElement,
        proposalData:  ObservingProposal): Promise<void> {

    // ensure there is a rendered overview.
    if(element !== null) {
        // convert overview to png.
        const canvas = await html2canvas(element);
        const data = canvas.toDataURL('image/png');

        // convert png to pdf.
        const pdfGenerator = new JSPDF();
        const imgProperties =
            pdfGenerator.getImageProperties(data);
        const pdfWidth =
            pdfGenerator.internal.pageSize.getWidth();
        const pdfHeight =
            (imgProperties.height * pdfWidth) /
            imgProperties.width;
        pdfGenerator.addImage(
            data, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // determine correct title for the pdf.
        let title = 'UnNamedProposal.pdf';
        if (proposalData?.title) {
            title = `${proposalData.title}.pdf`;
        }

        // get pdf data.
        const pdfData = pdfGenerator.output();
        console.log(pdfData);

        const zip = new JSZip();
        zip.file(title, pdfData);
        zip.generateAsync({type: "blob"}).then((zipData: Blob | MediaSource) => {
            // Create a download link for the zip file
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(zipData);
            link.download = "proposal.zip";
            link.click();
        });

        //const zip = new ZipArchive();
        /*zip.set(title, pdfData);

        const zipData = zip.to_blob();

        // Create a download link for the zip file
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(zipData);
        link.download = "proposal.zip";
        link.click();*/
    } else {
        // something failed in the rendering of the overview react element.
        console.error(
            'Tried to download a Overview that had not formed correctly.');
    }


}

export default downloadProposal