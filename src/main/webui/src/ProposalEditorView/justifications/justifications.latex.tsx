import {ReactElement} from "react";
import {Button, Container, FileButton, Group, Loader, ScrollArea, Table} from "@mantine/core";
import UploadButton from "../../commonButtons/upload.tsx";
import {useJustificationsResourceGetLatexResourceFiles} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import DeleteButton from "../../commonButtons/delete.tsx";
import {IconPdf, IconSkull} from "@tabler/icons-react";

export default
function JustificationLatex({which} : {which: string} ) : ReactElement {

    /*
        Requirements:
        - Upload button
        - Compile button
        - Download button
        - Display list of uploaded files each with a delete button
     */
    const { selectedProposalCode } = useParams();

    const uploadedFiles =
        useJustificationsResourceGetLatexResourceFiles(
            {pathParams: {proposalCode: Number(selectedProposalCode), which: which}}
    );

    if (uploadedFiles.error) {
        return(
            <Container>
                Error finding uploaded Latex resource files
            </Container>
        )
    }

    if (uploadedFiles.isLoading) {
        return (
            <Loader color={"orange"}/>
        )
    }

    const resourceFilesHeader = () : ReactElement => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Resource Files</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    //uploadedFile name will be unique to this Justification
    const resourceFilesBody = () : ReactElement => (
        <Table.Tbody>
            {uploadedFiles.data?.map((uploadedFile) => {
                return (
                    <Table.Tr key={uploadedFile}>
                        <Table.Td>
                            {uploadedFile}
                        </Table.Td>
                        <Table.Td>
                            <DeleteButton
                                toolTipLabel={"remove this file"}
                                onClick={handleRemoveFile}
                            />
                        </Table.Td>
                    </Table.Tr>
                )
            } )}
        </Table.Tbody>
    )



    const handleUpload = () => {console.log("file upload clicked")}

    const handleRemoveFile = () => {console.log("file remove clicked")}

    const handleCompile = () => {console.log("compile clicked")}

    const handleDownload = () => {console.log("download clicked")}

    return (
        <>
            <ScrollArea h={150}>
                <Table>
                    {resourceFilesHeader()}
                    {resourceFilesBody()}
                </Table>
            </ScrollArea>

            <Group grow>
                <FileButton onChange={handleUpload}>
                    {
                        (props) =>
                            <UploadButton
                                toolTipLabel={"upload file: .bib, .png, .jpg"}
                                label={"Upload"}
                                onClick={props.onClick}
                                variant={"filled"}
                            />
                    }
                </FileButton>
                <Button
                    rightSection={<IconSkull />}
                    onClick={handleCompile}
                >
                    Compile
                </Button>
                <Button
                    rightSection={<IconPdf />}
                    onClick={handleDownload}
                >
                    Download
                </Button>

            </Group>


        </>
    )
}