import JSZip from 'jszip';
import {ObjectIdentifier, ObservingProposal, SubmittedProposal,} from 'src/generated/proposalToolSchemas';
import {
    fetchSubmittedProposalResourceGetSubmittedProposal,
    fetchSupportingDocumentResourceGetSupportingDocuments,
    SubmittedProposalResourceGetSubmittedProposalsResponse,
    SupportingDocumentResourceGetSupportingDocumentsResponse,
} from 'src/generated/proposalToolComponents';
import {notifyError, notifySuccess} from '../../commonPanel/notifications';
import {
    extractTelescope,
    generatePdf,
    populateSupportingDocuments
} from '../../ProposalEditorView/proposal/downloadProposal';
import {OverviewPanelInternal} from '../../ProposalEditorView/proposal/Overview';
import {createRef, ReactElement, RefObject, useCallback, useEffect, useState} from 'react';
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
    fetchOpticalTelescopeTableData,
    TelescopeOverviewTableState,
    TelescopeTableState
} from "../../util/telescopeComms";
import {fetchSubmittedProposalResourceGetSubmittedProposalExport} from "../../util/submittedProposalsComms";

// the type for downloading proposals.
export type downloadMultipleProposalsProps = {
    data: SubmittedProposalResourceGetSubmittedProposalsResponse;
    forceUpdate: () => void;
    authToken: string;
    cycleTitle: string;
    navigate: NavigateFunction;
    queryClient: QueryClient;
    polarisMode: POLARIS_MODES;
    cycleID: number;
}

// the type for downloading proposals.
export type downloadSingleProposalsProps = {
    forceUpdate: () => void;
    authToken: string;
    navigate: NavigateFunction;
    queryClient: QueryClient;
    polarisMode: POLARIS_MODES;
    proposalDataPromise: Promise<SubmittedProposal>;
    proposalJSONPromise: Promise<undefined>;
    proposalID: string;
    proposalTitle: string;
    showInvestigators: boolean;
}

// interface of the types of data needed to be bootstrapped to get it to
// render properly.
export type PreFetchedOverviewData = {
    docs: SupportingDocumentResourceGetSupportingDocumentsResponse;
    telescopeData: Map<string, TelescopeTableState>;
    telescopeOverviewData: Map<string, TelescopeOverviewTableState>;
    proposalDetails: ObservingProposal;
    telescopeTiming: Map<string, number>;
}

/**
 * generates the html.
 *
 * @param resolvePdf callback for when done
 * @param rejectPdf callback when failed
 * @param root the root html
 * @param authToken the authentication token
 * @param forceUpdate the force update function
 * @param proposalCode the proposal data id.
 * @param container the container
 * @param navigate the navigate
 * @param queryClient the query client
 * @param polarisMode the polaris mode.
 * @param preFetchedData all data required by OverviewPanelInternal
 * @param showInvestigators flag to show investigators or not.
 */
const generateHTML = async (
    resolvePdf: (value: (Blob | PromiseLike<Blob>)) => void,
    rejectPdf: (reason?: unknown) => void,
    root: ReactDOM.Root,
    authToken: string,
    forceUpdate: () => void,
    proposalCode: string,
    container: HTMLDivElement,
    navigate: NavigateFunction,
    queryClient: QueryClient,
    polarisMode: POLARIS_MODES,
    preFetchedData: PreFetchedOverviewData,
    showInvestigators: boolean,
): Promise<void> => {
    try {
        // Create a ref to access the rendered component's element.
        const tempRef: RefObject<HTMLInputElement> = createRef();

        // Render the OverviewPanelInternal and store the instance.
        root.render(
            <MantineProvider theme={theme}>
                <ProposalContext.Provider value={{
                    user: {},
                    getToken: () => authToken,
                    authenticated: true,
                    selectedProposalCode: Number(proposalCode),
                    apiUrl: "",
                    mode: polarisMode
                }}>
                    <QueryClientProvider client={queryClient}>
                        <OverviewPanelInternal
                            forceUpdate={forceUpdate}
                            selectedProposalCode={proposalCode}
                            printRef={tempRef}
                            showInvestigators={showInvestigators}
                            expandAccordions={true}
                            authToken={authToken}
                            navigate={navigate}
                            queryClient={queryClient}
                            polarisMode={polarisMode}
                            cloneProposalMutation={null}
                            deleteProposalMutation={null}
                            deleteProposalOpticalTelescopeMutation={null}
                            submitOpticalProposalMutation={null}
                            proposalData={preFetchedData.proposalDetails}
                            telescopeData={preFetchedData.telescopeData}
                            telescopeOverviewData={
                                preFetchedData.telescopeOverviewData}
                            telescopeTimingResult={
                                preFetchedData.telescopeTiming}
                        />
                    </QueryClientProvider>
                </ProposalContext.Provider>
            </MantineProvider>
        );

        // Wait for the component to update.
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return the ref.
        if (tempRef.current === null) {
            rejectPdf(
                `Failed to render PDF for proposal 
                ${preFetchedData.proposalDetails.title} 
                 Ref was null after render wait.`);
        } else {
            // Use the ref to get the element.
            const generatedPdfData = await generatePdf(tempRef.current);
            resolvePdf(generatedPdfData);
        }

    } catch (error) {
        rejectPdf(
            `Error in PDF generation for proposal 
            ${preFetchedData.proposalDetails.title} with ${error}`);
    } finally {
        if (container && container.parentNode === document.body) {
            document.body.removeChild(container);
        }
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
        if (blob) {
            zip.file(JSON_FILE_NAME, blob)
        } else {
            notifyError(
                "Export Error",
                `No JSON blob received for proposal${selectedProposalCode}.`);
        }
    }).catch((error) => {
        notifyError("Export Error", getErrorMessage(error));
    });
}

/**
 * handles the construction of a single proposals zip.
 * @param props contains all the data.
 */
export const handleSingleProposal = async (props: downloadSingleProposalsProps):
        Promise<JSZip | null> => {
    const { forceUpdate, authToken, navigate, queryClient, polarisMode,
            proposalDataPromise, proposalJSONPromise, proposalID,
            proposalTitle, showInvestigators} = props;

    const proposalZip = new JSZip();

    let container: HTMLDivElement | null = null;
    let root: ReactDOM.Root | null = null;

    try {
        // PRE-FETCH ALL DATA FOR THE CURRENT PROPOSAL
        const docsPromise = fetchSupportingDocumentResourceGetSupportingDocuments(
            {
                headers: {authorization: `Bearer ${authToken}`},
                pathParams: {proposalCode: Number(proposalID)}
            });
        const telescopeDataPromise = fetchOpticalTelescopeTableData(
            {
                proposalID: proposalID
            });
        const telescopeOverviewDataPromise = fetchOpticalOverviewTelescopeTableData(
            {
                proposalID: proposalID
            });
        const telescopeTimingPromise =
            fetchOpticalOverviewTelescopeTimingData();

        const [
            docs, telescopeData, telescopeOverviewData, proposalDetails,
            telescopeTiming, proposalJSON
        ] = await Promise.all([
            docsPromise, telescopeDataPromise,
            telescopeOverviewDataPromise, proposalDataPromise,
            telescopeTimingPromise, proposalJSONPromise])


        // process json file.
        if (proposalJSON) {
            proposalZip.file(JSON_FILE_NAME, proposalJSON)
        } else {
            notifyError(
                "Export Error",
                `No JSON blob received for proposal${proposalID}.`);
        }

        // Ensure proper conversion to Map from plain objects.
        const convertedTelescopeData: Map<string, TelescopeTableState> =
            new Map<string, TelescopeTableState>(Object.entries(telescopeData));
        const convertedTelescopeOverviewData:
            Map<string, TelescopeOverviewTableState> =
                new Map(Object.entries(telescopeOverviewData));
        const convertedTelescopeTiming: Map<string, number> =
            new Map(Object.entries(telescopeTiming));

        // Use a single container for the entire process
        container = document.createElement('div');
        document.body.appendChild(container);
        root = ReactDOM.createRoot(container);

        //  Wrap the OverviewPanelInternal rendering and PDF generation in a function.
        const generatedPdfData = await new Promise<Blob>(
            (resolvePdf, rejectPdf) => {
                generateHTML(
                    resolvePdf, rejectPdf, root!, authToken,
                    forceUpdate, proposalID,
                    container!, navigate, queryClient,
                    polarisMode,
                    {
                        docs,
                        telescopeData: convertedTelescopeData,
                        telescopeOverviewData: convertedTelescopeOverviewData,
                        proposalDetails,
                        telescopeTiming: convertedTelescopeTiming
                    },
                    showInvestigators
                );
            }
        );

        // ensure blob.
        if (generatedPdfData) {
            proposalZip.file(OVERVIEW_PDF_FILENAME, generatedPdfData);
        }


        const supportingDocumentData: ObjectIdentifier[] =
            await fetchSupportingDocumentResourceGetSupportingDocuments({
                headers: {authorization: `Bearer ${authToken}`},
                pathParams: {proposalCode: Number(proposalID)},
            });

        const promises: Promise<void>[] =
            populateSupportingDocuments(
                proposalZip, supportingDocumentData,
                proposalID, authToken
            );

        await extractTelescope(
            proposalID, promises, proposalZip);
        await Promise.all(promises);
        return proposalZip;

    } catch (error: unknown) {
        notifyError(
            `Proposal Export Failed for ${proposalTitle}`,
            getErrorMessage(error));
        return null; // Return null on error
    } finally {
        if (container && document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
}


/**
 * generates the html.
 *
 * @param data the data for proposals
 * @param forceUpdate the force update function
 * @param authToken the authentication token
 * @param navigate the navigate
 * @param queryClient the query client
 * @param polarisMode the polaris mode.
 * @param cycleTitle the cycle name
 * @param cycleID the cycle id
 */
// eslint-disable-next-line react-refresh/only-export-components
const ProposalDownloader = (
    { data, forceUpdate, authToken, cycleTitle, navigate,
        queryClient, polarisMode, cycleID }: downloadMultipleProposalsProps):
    ReactElement => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        setDownloading(true);
        const topZip = new JSZip();
        const proposalPromises: Promise<void>[] = []; // Ensure type consistency

        for (const proposalData of data) {
            const proposalID: number = proposalData.dbid!;
            const proposalIDString: string = proposalID.toString();
            const proposalName = proposalData.name!;

            // Push the promise that wraps the single proposal handling and
            // adds to topZip
            const proposalDetailsPromise =
                fetchSubmittedProposalResourceGetSubmittedProposal(
                    {
                        headers: {authorization: `Bearer ${authToken}`},
                        pathParams: {
                            submittedProposalId: proposalID,
                            cycleCode: cycleID
                        }
                    });

            const proposalJSONPromise =
                fetchSubmittedProposalResourceGetSubmittedProposalExport({
                headers: {authorization: `Bearer ${authToken}`},
                pathParams: {
                    submittedProposalId: proposalID,
                    cycleCode: cycleID,
                    investigatorsIncluded: false
                }
            })

            proposalPromises.push(
                handleSingleProposal({
                    forceUpdate, authToken, navigate,
                    queryClient, polarisMode,
                    proposalDataPromise:proposalDetailsPromise,
                    proposalJSONPromise, proposalID:proposalIDString,
                    proposalTitle:proposalName, showInvestigators:false,
                }).then(innerZip => {
                    if (innerZip) {
                        return innerZip.generateAsync({type: 'blob'})
                            .then(innerZipBuffer => {
                                topZip.file(proposalData.name!, innerZipBuffer);
                            });
                    }
                    // If innerZip is null (due to error), this promise
                    // resolves to void, allowing others to continue
                    return Promise.resolve();
                }).catch(error => {
                    console.error(
                        `Failed to process single proposal
                         ${proposalData.name} during zip creation:`, error);
                })
            );
        }

        try {
            // wait till all single proposals are complete.
            await Promise.all(proposalPromises);

            // generate top zip. Only generate if there are files
            if (Object.keys(topZip.files).length > 0) {
                const zipData = await topZip.generateAsync({ type: 'blob' });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(new Blob([zipData]));
                link.download =
                    cycleTitle.replace(/\s/g, "").substring(0, 31) + ".zip";
                link.click();
                window.URL.revokeObjectURL(link.href);
                notifySuccess(
                    'Proposal Export Complete',
                    'Proposals exported and downloaded'
                );
            } else {
                notifyError(
                    'Proposal Export Failed',
                    'No proposals were successfully processed to generate a ' +
                    'zip file.'
                );
            }

        } catch (error: unknown) {
            // This catch block will only be hit if an unhandled error occurs
            // outside the specific proposal processing.
            notifyError(
                'Overall Proposal Export Failed', getErrorMessage(error));
            console.error("Error creating or downloading top zip", error);
        } finally {
            setDownloading(false);
            console.log("[ProposalDownloader] Download process finished.");
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
        document.body.appendChild(container);
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