import JSZip from 'jszip';
import {
    fetchSubmittedProposalResourceGetSubmittedProposal,
    SubmittedProposalResourceGetSubmittedProposalsResponse,
} from 'src/generated/proposalToolComponents';
import {notifyError, notifySuccess} from '../../commonPanel/notifications';
import {ReactElement, useCallback, useEffect, useState} from 'react';
import {NavigateFunction} from "react-router-dom";
import {QueryClient} from '@tanstack/react-query';
import {POLARIS_MODES} from "../../constants";
import getErrorMessage from "../../errorHandling/getErrorMessage";
import ReactDOM from 'react-dom/client';
import {fetchSubmittedProposalResourceGetSubmittedProposalExport} from "../../util/submittedProposalsComms";
import {handleSingleProposal} from "../../ProposalEditorView/proposal/downloadProposal";

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