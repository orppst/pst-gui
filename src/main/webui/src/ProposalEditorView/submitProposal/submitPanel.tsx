import {ReactElement, useEffect, useState} from "react";
import {Fieldset, Grid} from "@mantine/core";
import {useParams} from "react-router-dom";
import {useForm, UseFormReturnType} from "@mantine/form";
import ValidationOverview from "./ValidationOverview.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import SubmissionForm from "./submission.form.tsx";
import {
    useObservationResourceGetObservations
} from "../../generated/proposalToolComponents.ts";

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

    const observations = useObservationResourceGetObservations({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    let emptyObservationModeTuple : ObservationModeTuple[] = []

    const form : UseFormReturnType<SubmissionFormValues> = useForm({
        mode: 'uncontrolled',
        initialValues: {
            selectedCycle: 0,
            selectedModes: emptyObservationModeTuple
        },
        validate: {
            selectedCycle: (value) =>
                (value === 0 ? 'Please select a cycle' : null)
        }
    });

    useEffect(() => {
        if (observations.data) {
            //form.initialize only called once regardless of changes
            form.initialize({
                selectedCycle: 0,
                selectedModes: observations.data.map((obs) => (
                    {
                        observationId: obs.dbid!,
                        observationName: obs.name!,
                        observationType: obs.code!,
                        modeId: 0
                    }
                ))
            })
        }
    }, [observations.data]);

    /*
    useEffect(() => {
        fetchObservationResourceGetObservations({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        })
            .then((data : ObjectIdentifier[]) => {
                setInitialTuples(
                    data?.map((obs) => (
                        {
                            observationId: obs.dbid!,
                            observationName: obs.name!,
                            observationType: obs.code!,
                            modeId: 0
                        }
                    ))
                )
            })
    }, []);
    */

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
