import JSZip from 'jszip';
import {ObjectIdentifier, ObservingProposal,} from 'src/generated/proposalToolSchemas';
import {
    fetchSubmittedProposalResourceGetSubmittedProposal,
    fetchSupportingDocumentResourceGetSupportingDocuments,
    SubmittedProposalResourceGetSubmittedProposalsResponse,
    SupportingDocumentResourceGetSupportingDocumentsResponse,
} from 'src/generated/proposalToolComponents';
import {notifyError, notifySuccess} from '../../commonPanel/notifications';
import {
    extractTelescope, generatePdf,
    populateSupportingDocuments
} from '../../ProposalEditorView/proposal/downloadProposal';
import {OverviewPanelInternal} from '../../ProposalEditorView/proposal/Overview';
import {createRef, RefObject, useCallback, useEffect, useState} from 'react';
import {NavigateFunction} from "react-router-dom";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {JSON_FILE_NAME, OVERVIEW_PDF_FILENAME, POLARIS_MODES} from "../../constants";
import getErrorMessage from "../../errorHandling/getErrorMessage";
import ReactDOM from 'react-dom/client';
import {ProposalContext} from "../../App2";
import {MantineProvider} from "@mantine/core";
import {theme} from "../../main";
import {
    fetchOpticalOverviewTelescopeTableData,
    fetchOpticalOverviewTelescopeTimingData,
    fetchOpticalTelescopeTableData, TelescopeOverviewTableState,
    TelescopeTableState
} from "../../util/telescopeComms";
import {fetchSubmittedProposalResourceGetSubmittedProposalExport} from "../../util/submittedProposalsComms";

/**
 * generates the html.
 *
 * @param resolvePdf callback for when done
 * @param rejectPdf callback when failed
 * @param root the root html
 * @param authToken the authentication token
 * @param forceUpdate the force update function
 * @param proposalData the proposal data id.
 * @param container the container
 * @param navigate the navigate
 * @param queryClient the query client
 * @param polarisMode the polaris mode.
 * @param docs the supporting docs.
 * @param telescopeData the optical table data.
 * @param telescopeOverviewData the data required for overview
 * @param proposalDetails the proposal data
 * @param telescopeTiming the telescope timing data.
 */
const generateHTML = async (
        resolvePdf: (value: (Blob | PromiseLike<Blob>)) => void,
        rejectPdf: (reason?: unknown) => void,
        root: ReactDOM.Root,
        authToken: string,
        forceUpdate: () => void,
        proposalData: string,
        container: HTMLDivElement,
        navigate: NavigateFunction,
        queryClient: QueryClient,
        polarisMode: POLARIS_MODES,
        docs: SupportingDocumentResourceGetSupportingDocumentsResponse,
        telescopeData: Map<string, TelescopeTableState>,
        telescopeOverviewData: Map<string, TelescopeOverviewTableState>,
        proposalDetails: ObservingProposal,
        telescopeTiming: Map<string, number>,
    ): Promise<void> => {
    try {
        const renderOverview = async () => {
            //  Create a ref to access the rendered component's element
            const tempRef: RefObject<HTMLInputElement> = createRef();

            //  Render the OverviewPanelInternal and store the instance.
            root.render(
                <MantineProvider theme={theme}>
                    <ProposalContext.Provider value={{
                        user: {},
                        getToken: () => authToken,
                        authenticated: true,
                        selectedProposalCode: Number(proposalData),
                        apiUrl: "",
                        mode: POLARIS_MODES.OPTICAL
                    }}>
                        <QueryClientProvider client={queryClient}>
                            <OverviewPanelInternal
                                forceUpdate={forceUpdate}
                                selectedProposalCode={proposalData}
                                printRef={tempRef}  // Pass the ref here
                                showInvestigators={false}
                                expandAccordions={true}
                                authToken={authToken}
                                navigate={navigate}
                                queryClient={queryClient}
                                polarisMode={polarisMode}
                                cloneProposalMutation={null}
                                deleteProposalMutation={null}
                                deleteProposalOpticalTelescopeMutation={null}
                                submitOpticalProposalMutation={null}
                                proposalData={proposalDetails}
                                supportingDocs={docs}
                                telescopeData={telescopeData}
                                telescopeOverviewData={telescopeOverviewData}
                                telescopeTimingResult={telescopeTiming}
                            />
                        </QueryClientProvider>
                    </ProposalContext.Provider>
                </MantineProvider>
            );

            // Wait for the component to update.
            let complete = false;
            let count = 0;
            while(!complete && count < 5) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                if(tempRef.current !== null) {
                    complete = true;
                }
                count = count + 1;
            }

            //  Return the ref.
            if(tempRef.current === null) {
                rejectPdf(
                    `Failed to render pdf for proposal ${proposalDetails.title} 
                    by end of 25s.`);
            } else {
                notifySuccess(
                    "pdf success",
                    `pdf generated for proposal ${proposalDetails.title}`)
                return tempRef;
            }
        };

        //  Get the ref to the rendered element.
        const myRef = await renderOverview();

        //  Use the ref to get the element.
        const generatedPdfData = await generatePdf(myRef!.current!);
        document.body.removeChild(container);
        resolvePdf(generatedPdfData);

    } catch (error) {
        rejectPdf(error);
    }
}

/**
 * fills a json file to the zip.
 *
 * @param authToken the authentication token
 * @param selectedProposalCode the proposal code
 * @param zip the zip.
 * @param includeInvestigators flag for adding investigators or not.
 * @param cycleCode number for the cycle code.
 */
export function extractJSON(
    authToken: string, selectedProposalCode: string, zip: JSZip,
    includeInvestigators: boolean, cycleCode: number):
    Promise<void> {
    return fetchSubmittedProposalResourceGetSubmittedProposalExport({
        headers: {authorization: `Bearer ${authToken}`},
        pathParams: {
            submittedProposalId: Number(selectedProposalCode),
            cycleCode: cycleCode,
            investigatorsIncluded: includeInvestigators
        }
    }).then((blob) => {
        zip.file(JSON_FILE_NAME, blob!)
    })
        .catch((error) =>
            notifyError("Export Error", getErrorMessage(error))
        )
}


/**
 * generates the html.
 *
 * @param resolvePdf callback for when done
 * @param authToken the authentication token
 * @param forceUpdate the force update function
 * @param navigate the navigate
 * @param queryClient the query client
 * @param polarisMode the polaris mode.
 * @param cycleTitle the cycle name
 * @param cycleID the cycle id
 */
// eslint-disable-next-line react-refresh/only-export-components
const ProposalDownloader = (
    { data, forceUpdate, authToken, cycleTitle, navigate,
      queryClient, polarisMode, cycleID }: {
    data: SubmittedProposalResourceGetSubmittedProposalsResponse;
    forceUpdate: () => void;
    authToken: string;
    cycleTitle: string;
    navigate: NavigateFunction;
    queryClient: QueryClient;
    polarisMode: POLARIS_MODES;
    cycleID: number;
}) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        setDownloading(true);
        const topZip = new JSZip();
        const proposalPromises: Promise<void>[] = [];

        for (const proposalData of data) {
            // eslint-disable-next-line no-async-promise-executor
            const proposalPromise = new Promise<void>(async (resolve, reject) => {
                try {
                    // PRE-FETCH ALL DATA FOR THE CURRENT PROPOSAL
                    const docsPromise = fetchSupportingDocumentResourceGetSupportingDocuments(
                        {   headers: {authorization: `Bearer ${authToken}`},
                            pathParams: { proposalCode: Number(proposalData.dbid) } });
                    const telescopeDataPromise = fetchOpticalTelescopeTableData(
                        {
                          proposalID: proposalData.dbid!.toString() });
                    const telescopeOverviewDataPromise = fetchOpticalOverviewTelescopeTableData(
                        {
                          proposalID: proposalData.dbid!.toString() });
                    const proposalDetailsPromise = fetchSubmittedProposalResourceGetSubmittedProposal(
                        { headers: {authorization: `Bearer ${authToken}`},
                          pathParams: { submittedProposalId: Number(proposalData.dbid),
                                        cycleCode: cycleID} });
                    const telescopeTimingPromise =
                        fetchOpticalOverviewTelescopeTimingData();

                    const [
                        docs, telescopeData, telescopeOverviewData, proposalDetails,
                        telescopeTiming
                    ] = await Promise.all([
                        docsPromise, telescopeDataPromise,
                        telescopeOverviewDataPromise, proposalDetailsPromise,
                        telescopeTimingPromise])

                    // Use a single container for the entire process
                    const container = document.createElement('div');
                    document.body.appendChild(container);
                    const root = ReactDOM.createRoot(container);

                    //  Wrap the OverviewPanelInternal rendering and PDF generation in a function.
                    const renderAndGeneratePdf = async (): Promise<Blob> => {
                        // eslint-disable-next-line no-async-promise-executor
                        return new Promise<Blob>(
                            // eslint-disable-next-line no-async-promise-executor
                            async (resolvePdf, rejectPdf) => {
                                const convertedTelescopeData:
                                    Map<string, TelescopeTableState> =
                                    new Map<string, TelescopeTableState>(
                                        Object.entries(telescopeData));
                                const convertedTelescopeOverviewData =
                                    new Map(Object.entries(telescopeOverviewData));
                                const convertedTelescopeTiming =
                                    new Map(Object.entries(telescopeTiming));
                                await generateHTML(
                                    resolvePdf, rejectPdf, root, authToken,
                                    forceUpdate, proposalData.dbid!.toString(),
                                    container, navigate, queryClient,
                                    polarisMode, docs,
                                    convertedTelescopeData,
                                    convertedTelescopeOverviewData,
                                    proposalDetails, convertedTelescopeTiming)
                            });
                    };

                    // Await the PDF data.
                    const generatedPdfData = await renderAndGeneratePdf();

                    // ensure blob.
                    const proposalZip = new JSZip();
                    if (generatedPdfData) {
                        proposalZip.file(
                            OVERVIEW_PDF_FILENAME, generatedPdfData);
                    }

                    const supportingDocumentData: ObjectIdentifier[] =
                        await fetchSupportingDocumentResourceGetSupportingDocuments({
                            headers: {authorization: `Bearer ${authToken}`},
                            pathParams: { proposalCode: proposalData.dbid! },
                        });

                    const promises: Promise<void>[] =
                        populateSupportingDocuments(
                            proposalZip, supportingDocumentData,
                            proposalData.dbid!.toString(),
                            authToken
                        );

                    promises.push(extractJSON(
                        authToken, proposalData.dbid!.toString(),
                        proposalZip, false, cycleID));
                    await extractTelescope(
                        proposalData.dbid!.toString(), promises,
                        proposalZip);
                    await Promise.all(promises);

                    const innerZipBuffer =
                        await proposalZip.generateAsync({ type: 'blob' });
                    topZip.file(proposalData.name!, innerZipBuffer);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
            proposalPromises.push(proposalPromise);
        }

        try {
            await Promise.all(proposalPromises);
            const zipData = await topZip.generateAsync({ type: 'blob' });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(new Blob([zipData]));
            link.download =
                cycleTitle.replace(/\s/g, "").substring(0, 31) + ".zip";
            link.click();
            window.URL.revokeObjectURL(link.href); // Clean up the URL object.
            notifySuccess(
                'Proposal Export Complete',
                'Proposals exported and downloaded'
            );
        } catch (error: unknown) {
            notifyError('Proposal Export Failed', getErrorMessage(error));
            console.error("Error creating or downloading top zip", error);
        } finally {
            setDownloading(false);
        }
    }, [data, forceUpdate, authToken, cycleTitle, navigate, queryClient,
        polarisMode, cycleID]);

    useEffect(() => {
        handleDownload().then();
    }, [handleDownload]);

    return (
        <div>
            {downloading && <div>Downloading Proposals...</div>}
        </div>
    );
};

export const downloadProposals = (
    data: SubmittedProposalResourceGetSubmittedProposalsResponse,
    forceUpdate: () => void,
    authToken: string,
    cycleTitle: string,
    navigate: NavigateFunction,
    queryClient: QueryClient,
    polarisMode: POLARIS_MODES,
    cycleID: number,
): Promise<void> => {
    return new Promise<void>((resolve) => {
        const container = document.createElement('div');
        const root = ReactDOM.createRoot(container);
        root.render(
            <ProposalDownloader
                data={data}
                forceUpdate={forceUpdate}
                authToken={authToken}
                cycleTitle={cycleTitle}
                navigate={navigate}
                queryClient={queryClient}
                polarisMode={polarisMode}
                cycleID={cycleID}
            />
        );
        resolve();
    });
};
