import {ReactElement, useState} from "react";
import {Fieldset, Grid,} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useForm, UseFormReturnType} from "@mantine/form";
import ValidationOverview from "./ValidationOverview.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import SubmissionForm from "./submission.form.tsx";

export interface SubmissionFormValues {
    selectedCycle: number
}

export default
function SubmitPanel(): ReactElement {

    const {selectedProposalCode} = useParams();

    const [isProposalReady, setIsProposalReady] = useState(false);

    const form : UseFormReturnType<SubmissionFormValues> = useForm({
        initialValues: {
            selectedCycle: 0,
        },
        validate: {
            selectedCycle: (value) =>
                (value === 0 ? 'Please select a cycle' : null)
        }
    });

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Submit"} />
            <Grid columns={10}>
                <Grid.Col span={5}>
                    <Fieldset legend={"Submission Form"}>
                        <SubmissionForm form={form} isProposalReady={isProposalReady} />
                    </Fieldset>
                </Grid.Col>
                <Grid.Col span={5}>
                    <Fieldset legend={"Ready Status"}>
                        <ValidationOverview cycle={form.getValues().selectedCycle} setValid={setIsProposalReady}/>
                    </Fieldset>
                </Grid.Col>
            </Grid>
        </PanelFrame>
    )
}
