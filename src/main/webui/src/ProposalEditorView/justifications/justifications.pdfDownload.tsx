import {ReactElement, useEffect, useState} from "react";
import {
    fetchJustificationsResourceDownloadLatexPdf,
    useJustificationsResourceCheckForPdf
} from "../../generated/proposalToolComponents.ts";
import {Button, Fieldset, Group, Loader, Text} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {notifyError} from "../../commonPanel/notifications.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {IconPdf} from "@tabler/icons-react";

export default
function JustificationsPDFDownload(): ReactElement {

    const { selectedProposalCode } = useParams();
    const {fetcherOptions} = useProposalToolContext();
    const [pdfDownLoad, setPdfDownload] = useState("");

    const checkPDF = useJustificationsResourceCheckForPdf({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    useEffect(() => {
        if (checkPDF.status === 'success' && checkPDF.data as unknown as boolean) {
            fetchJustificationsResourceDownloadLatexPdf({
                ...fetcherOptions,
                pathParams: {proposalCode: Number(selectedProposalCode)},
            })
                .then((blob) => {
                    setPdfDownload(window.URL.createObjectURL(blob as unknown as Blob));
                })
                .catch((error) => {
                    //it seems our checkPDF endpoint doesn't work
                    if (!getErrorMessage(error).includes("Nonexistent file")) {
                        notifyError("Failed to get latex output PDF", getErrorMessage(error))
                    }
                })
        }
    }, [checkPDF.status]);

    if (checkPDF.isLoading) {
        return (<Loader/>)
    }

    if (checkPDF.isError) {
        return (
            <AlertErrorMessage
                title={"Check for PDF output fail"}
                error={getErrorMessage(checkPDF.isError)}
            />
        )
    }

    return (
        <Fieldset legend={"Justification Output"}>
            {
                checkPDF.data as unknown as boolean ?
                    <Group grow>
                        <Button
                            rightSection={<IconPdf />}
                            component={"a"}
                            download={"compiledJustification.pdf"}
                            href={pdfDownLoad}
                            color={"blue"}
                        >
                            Download
                        </Button>
                    </Group>
                    :
                    <Text size={"sm"} c={"red"}>
                        No PDF output, please compile
                    </Text>
            }
        </Fieldset>
    )
}