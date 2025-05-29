import {ReactElement, useEffect, useState} from "react";
import {Button, Stack, Textarea, Tooltip} from "@mantine/core";
import {CLOSE_DELAY, OPEN_DELAY} from "../../constants.tsx";
import {IconPdf} from "@tabler/icons-react";
import {fetchJustificationsResourceDownloadLatexPdf} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

export default
function JustificationsLatexStatus({latexStatus} : {latexStatus: string}) : ReactElement {

    const {selectedProposalCode} = useParams();
    const {fetcherOptions} = useProposalToolContext();

    const [pdfDownLoad, setPdfDownload] = useState("");
    const [downloadReady, setDownloadReady] = useState(false);

    useEffect(() => {
        if (latexStatus.includes('Latex compilation successful')) {
            fetchJustificationsResourceDownloadLatexPdf({
                ...fetcherOptions,
                pathParams: {proposalCode: Number(selectedProposalCode)},
            })
                .then((blob) => {
                    setPdfDownload(window.URL.createObjectURL(blob as unknown as Blob));
                    setDownloadReady(true);
                })
                .catch((error) => {
                    notifyError("Failed to get latex output PDF", getErrorMessage(error))
                })
        }
    }, [latexStatus]);

    return (
        <Stack>
            <Textarea
                label={"Compilation output"}
                placeholder={"Compilation status will appear here"}
                value={latexStatus}
                autosize
                minRows={20}
                maxRows={20}
            />
            <Tooltip
                label={downloadReady ?
                    "Download compiled output of your justification" :
                    "No output file found, successful compilation required"}
                openDelay={OPEN_DELAY}
                closeDelay={CLOSE_DELAY}
            >
                <Button
                    disabled={!downloadReady}
                    rightSection={<IconPdf />}
                    component={"a"}
                    download={"justification.pdf"}
                    href={pdfDownLoad}
                    color={"blue"}
                >
                    Download
                </Button>
            </Tooltip>
        </Stack>
    )
}