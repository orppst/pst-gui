import {ReactElement, useState} from "react";
import {Fieldset, Stack} from "@mantine/core";
import {useParams} from "react-router-dom";
import ValidationOverview from "./ValidationOverview.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import SubmissionForm from "./submission.form.tsx";

export type ObservationModeTuple = {
    observationId: number,
    observationName: string,
    observationType: string,
    modeId: number
}

export interface SubmissionFormValues {
    selectedCycle: number
    selectedModes: ObservationModeTuple[]
}

export default
function SubmitPanel(): ReactElement {

    const {selectedProposalCode} = useParams();

    const [isProposalReady, setIsProposalReady] = useState(false);

    const [selectedCycle, setSelectedCycle] = useState(0);

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Submit"} />
            <Stack>
                <Fieldset legend={"Ready Status"}>
                    <ValidationOverview
                        cycle={selectedCycle}
                        setValid={setIsProposalReady}
                    />
                </Fieldset>
                <Fieldset legend={"Submission Form"}>
                    <SubmissionForm
                        isProposalReady={isProposalReady}
                        setSelectedCycle={setSelectedCycle}
                    />
                </Fieldset>
            </Stack>
        </PanelFrame>
    )
}
