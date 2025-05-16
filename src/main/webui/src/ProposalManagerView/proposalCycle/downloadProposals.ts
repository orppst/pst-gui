import {
    fetchSupportingDocumentResourceGetSupportingDocuments,
    SubmittedProposalResourceGetSubmittedProposalsResponse
} from "../../generated/proposalToolComponents";
import * as Schemas from "../../generated/proposalToolSchemas";
import * as JSZip from "jszip";
import {OverviewPanelInternal} from "../../ProposalEditorView/proposal/Overview";
import {
    extractJSON, extractTelescope,
    generatePdf,
    populateSupportingDocuments
} from "../../ProposalEditorView/proposal/downloadProposal";
import {OVERVIEW_PDF_FILENAME, POLARIS_MODES} from "../../constants";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas";
import {notifyError, notifySuccess} from "../../commonPanel/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage";
import {NavigateFunction} from "react-router-dom";
import {QueryClient} from "@tanstack/react-query";
export async function downloadProposals(
        data: SubmittedProposalResourceGetSubmittedProposalsResponse,
        forceUpdate: () => void,
        authToken: string,
        cycleTitle: string,
        printRef: React.RefObject<HTMLInputElement>,
        navigate: NavigateFunction,
        queryClient: QueryClient,
        polarisMode: POLARIS_MODES):
        Promise<void> {

    const topZip = new JSZip();
    const proposalPromises: Promise<void>[] = [];

    data.map(async (proposalIDData: Schemas.ObjectIdentifier) => {
        const proposalPromise = new Promise<void>(() => {
            // generate the html which will become the pdf.
            OverviewPanelInternal({
                forceUpdate: forceUpdate,
                selectedProposalCode: proposalIDData.dbid!.toString(),
                printRef: printRef,
                showInvestigators: false,
                expandAccordions: true,
                authToken: authToken,
                navigate: navigate,
                queryClient: queryClient,
                polarisMode: polarisMode,
            });
            const pdfData = generatePdf(printRef.current!);
            // build the zip object and populate with the corresponding documents.
            let proposalZip = new JSZip();
            proposalZip = proposalZip.file(OVERVIEW_PDF_FILENAME, pdfData);

            // extract supporting documents.
            fetchSupportingDocumentResourceGetSupportingDocuments(
                {
                    pathParams: {
                        proposalCode: proposalIDData.dbid!
                    }
                }
            ).then(async (supportingDocumentData: ObjectIdentifier[]) => {
                // add supporting documents to the zip.
                const promises = populateSupportingDocuments(
                    proposalZip, supportingDocumentData,
                    proposalIDData.dbid!.toString(),
                    authToken
                );

                // get proposal json.
                promises.push(extractJSON(
                    authToken, proposalIDData.dbid!.toString(), proposalZip));

                // process optical data.
                await extractTelescope(
                    proposalIDData.dbid!.toString(), promises, proposalZip);

                // put all files in the top zip.
                Promise.all(promises).then(
                    () => {
                        const innerZipBuffer = proposalZip.generateAsync(
                            {type: "blob"});
                        topZip.file(proposalIDData.name!, innerZipBuffer);
                    })
            });
        });
        proposalPromises.push(proposalPromise);
    });

    try {
        await Promise.all(proposalPromises);
        // all inner zips should be done here.
        const zipData = await topZip.generateAsync({type: "blob"});

        // Create a download link for the zip file
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([zipData]));
        link.download = cycleTitle.replace(/\s/g, "").substring(0, 31) + ".zip";
        link.click();
        window.URL.revokeObjectURL(link.href); // Clean up the URL object.

        notifySuccess(
            "Proposal Export Complete", "proposal exported" +
            " and downloaded")
    } catch(error: unknown) {
        notifyError("Proposal Export Failed", getErrorMessage(error));
        console.error("Error creating or downloading top zip", error);
    }
}