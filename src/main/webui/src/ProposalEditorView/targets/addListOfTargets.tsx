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

    //I want to have: accept={"application/xml,text/ecsv,text/csv,text/plain"} here but 'text/escv' is not a thing,
    // and it then blocks the ability to upload *.ecsv files.
    return(
        <FileButton onChange={handleUpload}>
            {
                (props) =>
                    <UploadButton
                        toolTipLabel={"Upload a list of targets from a file (xml, (e)csv, txt)"}
                        label={"Upload List of Targets"}
                        onClick={props.onClick}
                    />
            }
        </FileButton>
    )
}