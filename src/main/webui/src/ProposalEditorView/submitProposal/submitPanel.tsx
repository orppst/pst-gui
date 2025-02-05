import {ReactElement} from "react";
import {Fieldset, Stack} from "@mantine/core";
import {useParams} from "react-router-dom";
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



    /*

    const [selectedCycle, setSelectedCycle] = useState(0);
                    <Fieldset legend={"Ready Status"}>
                    {
                        selectedCycle && selectedCycle != 0 ?
                            <ValidationOverview cycle={selectedCycle} />:
                            <Text c={"grey"} size={"sm"}>
                                This will show the validation status of your proposal after you select a proposal cycle below.
                            </Text>
                    }
                </Fieldset>
     */




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
