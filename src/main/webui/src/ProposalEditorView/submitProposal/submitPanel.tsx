import {ReactElement} from "react";
import {Fieldset, Stack} from "@mantine/core";
import {useParams} from "react-router-dom";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import SubmissionForm from "./submission.form.tsx";

export type ObservationModeTuple = {
    observationId: number,
    observationName: string,
    observationType: string,
    modeId: number,
    modeName: string
}

export interface SubmissionFormValues {
    selectedCycle: number
    selectedModes: ObservationModeTuple[]
}

export default
function SubmitPanel(): ReactElement {
    const {selectedProposalCode} = useParams();

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Submit"} />
            <Stack>
                <Fieldset legend={"Submission Form"}>
                    <SubmissionForm/>
                </Fieldset>
            </Stack>
        </PanelFrame>
    )
}
