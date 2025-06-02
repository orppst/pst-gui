import {ObjectIdentifier, ObservingProposal, SubmittedProposal} from 'src/generated/proposalToolSchemas.ts';
import html2canvas from 'html2canvas';
// renamed to bypass ESlint issues about constructors needing to be capital letters.
import { jsPDF as JSPDF } from 'jspdf';
// used the import * as it bypasses a fault with how this is meant to be imported.
import * as JSZip from 'jszip';
import {
    fetchProposalResourceExportProposal,
    fetchSupportingDocumentResourceDownloadSupportingDocument,
    fetchSupportingDocumentResourceGetSupportingDocuments,
    SupportingDocumentResourceGetSupportingDocumentsResponse
} from 'src/generated/proposalToolComponents.ts';
import {JSON_FILE_NAME, OPTICAL_FOLDER_NAME, OVERVIEW_PDF_FILENAME, POLARIS_MODES} from 'src/constants.tsx';
import {notifyError, notifyInfo, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {
    fetchOpticalOverviewTelescopeTableData,
    fetchOpticalOverviewTelescopeTimingData,
    fetchOpticalTelescopeResourceGetProposalObservationIds,
    fetchOpticalTelescopeResourceLoadTelescopeData,
    fetchOpticalTelescopeTableData,
    SaveTelescopeState, TelescopeOverviewTableState,
    TelescopeTableState
} from "../../util/telescopeComms";
import {NavigateFunction} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import {createRef, RefObject} from "react";
import {MantineProvider} from "@mantine/core";
import {theme} from "../../main";
import {ProposalContext} from "../../App2";
import {OverviewPanelInternal} from "./Overview";

// interface of the types of data needed to be bootstrapped to get it to
// render properly.
export type PreFetchedOverviewData = {
    docs: SupportingDocumentResourceGetSupportingDocumentsResponse;
    telescopeData: Map<string, TelescopeTableState>;
    telescopeOverviewData: Map<string, TelescopeOverviewTableState>;
    proposalDetails: ObservingProposal;
    telescopeTiming: Map<string, number>;
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