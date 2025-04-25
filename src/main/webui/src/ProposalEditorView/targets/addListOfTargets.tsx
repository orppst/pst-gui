import {ReactElement} from "react";
import {useProposalResourceUploadTargetList} from "../../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {FileButton} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";

export default function AddListOfTargets(p: {
    proposalCode: number
}) : ReactElement {

    const queryClient = useQueryClient();

    const uploadTargetList =
        useProposalResourceUploadTargetList();

    const handleUpload = async (fileUpload: File | null) => {
        if (fileUpload) {
            const formData = new FormData();
            formData.append("document", fileUpload);

            uploadTargetList.mutate({
                pathParams: {proposalCode: p.proposalCode},
                //@ts-ignore
                body: formData,
                //@ts-ignore
                headers: {"Content-Type": "multipart/form-data"}
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries();
                    notifySuccess("Upload successful",
                        "The target list has been uploaded and added to the proposal");
                },
                onError: (error) => {
                    notifyError("Upload failed", getErrorMessage(error));
                }
            })

        }
    }

    return(
        <FileButton onChange={handleUpload} accept={"application/xml,text/csv,text/plain"}>
            {
                (props) =>
                    <UploadButton
                        toolTipLabel={"Upload a list of targets from a file (xml, csv, txt)"}
                        label={"Upload List of Targets"}
                        onClick={props.onClick}
                    />
            }
        </FileButton>
    )
}