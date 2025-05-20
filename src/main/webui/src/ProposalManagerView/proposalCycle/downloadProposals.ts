import JSZip from 'jszip';
import {
    ObjectIdentifier,
} from 'src/generated/proposalToolSchemas';
import {
    fetchSupportingDocumentResourceGetSupportingDocuments,
    SubmittedProposalResourceGetSubmittedProposalsResponse
} from 'src/generated/proposalToolComponents';
import { notifyError, notifySuccess } from '../../commonPanel/notifications';
import {
    extractJSON,
    extractTelescope,
    generatePdf,
    populateSupportingDocuments
} from '../../ProposalEditorView/proposal/downloadProposal';
import { OverviewPanelInternal } from '../../ProposalEditorView/proposal/Overview';
import { useRef, useState, useEffect, useCallback } from 'react';
import {NavigateFunction} from "react-router-dom";
import {QueryClient} from "@tanstack/react-query";
import {POLARIS_MODES} from "../../constants";
import getErrorMessage from "../../errorHandling/getErrorMessage";


const OVERVIEW_PDF_FILENAME = 'overview.pdf';

export async function downloadProposals(
    data: SubmittedProposalResourceGetSubmittedProposalsResponse,
    forceUpdate: () => void,
    authToken: string,
    cycleTitle: string,
    printRef: React.RefObject<HTMLInputElement>,
    navigate: NavigateFunction,
    queryClient: QueryClient,
    polarisMode: POLARIS_MODES
): Promise<void> {

    const topZip = new JSZip();

    // Move the proposal processing logic into a useCallback
    const processProposals = useCallback(async (proposalsData: SubmittedProposalResourceGetSubmittedProposalsResponse) => {
        const proposalPromises: Promise<void>[] = []; // Array to hold all proposal promises

        for (const proposalIDData of proposalsData) {
            const proposalPromise = new Promise<void>(async (resolve, reject) => {
                try {
                    const printRef = useRef<HTMLInputElement>(null);
                    const [pdfData, setPdfData] =
                        useState<Promise<Blob> | null>(null);

                    useEffect(() => {
                        const createPdf = async () => {
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
                            setPdfData(pdfData);

                        };
                        createPdf();
                    }, []);

                    if (pdfData) {
                        const proposalZip = new JSZip();
                        proposalZip.file(OVERVIEW_PDF_FILENAME, pdfData);

                        const supportingDocumentData: ObjectIdentifier[] =
                            await fetchSupportingDocumentResourceGetSupportingDocuments({
                                pathParams: {proposalCode: proposalIDData.dbid!},
                            });

                        const promises: Promise<void>[] =
                            populateSupportingDocuments(
                                proposalZip, supportingDocumentData,
                                proposalIDData.dbid!.toString(),
                                authToken
                            );

                        promises.push(extractJSON(
                            authToken, proposalIDData.dbid!.toString(),
                            proposalZip));

                        await extractTelescope(
                            proposalIDData.dbid!.toString(), promises,
                            proposalZip);

                        await Promise.all(promises);
                        const innerZipBuffer =
                            await proposalZip.generateAsync({type: 'blob'});
                        topZip.file(proposalIDData.name!, innerZipBuffer);
                        resolve(); // Resolve the promise when done with this proposal
                    }
                } catch (error: unknown) {
                    notifyError(
                        "Proposal Export Failed",
                        `Failed to process proposal ${proposalIDData.name}: 
                        ${getErrorMessage(error)}`
                    );
                    console.error(
                        `Error processing proposal ${proposalIDData.name}`,
                        error);
                    reject(error); // Reject the promise on error
                }
            });
            proposalPromises.push(proposalPromise); // Add the promise to the array
        }
        await Promise.all(proposalPromises);

    }, [authToken, forceUpdate, navigate, polarisMode, queryClient, topZip]);


    // Wait for all proposals to be processed
    try {
        await processProposals(data);
        const zipData = await topZip.generateAsync({ type: 'blob' });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([zipData]));
        link.download = cycleTitle.replace(/\s/g, "").substring(0, 31) + ".zip";
        link.click();
        window.URL.revokeObjectURL(link.href); // Clean up the URL object.
        notifySuccess(
            'Proposal Export Complete',
            'Proposals exported and downloaded'
        );
    } catch (error: unknown) {
        notifyError('Proposal Export Failed', getErrorMessage(error));
        console.error("Error creating or downloading top zip", error);
    }
}