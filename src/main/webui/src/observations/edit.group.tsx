import TargetTypeForm from "./targetType.form.tsx";
import TimingWindowsForm from "./timingWindows.form.tsx";
import {ObservationProps} from "./observationPanel.tsx";
import {Fieldset, Grid} from "@mantine/core";
import {TimingWindow} from "../generated/proposalToolSchemas.ts";

/*
  We may want to do this in tabs, there's a significant amount of detail for one page:

  1. select target and observation type
  2. set technical goals and the "field"
  3. select timing-windows
 */

export interface TimingWindows {
    observationId: number,
    timingWindows: TimingWindow [] //do you ever feel like you might be running, head first, into naming problems?
}


export default function ObservationEditGroup(props: ObservationProps){

    /*
    For the TimingWindowForm the timingWindows array/list parameter should only contain 'TimingWindow'
    types rather than the generic 'Constraint', the class from which it inherits in Java. Issue being
    that the containing object, the 'observation', only has an array of 'Constraints'. We either
    separate the 'Constraints' based on their subtypes here, or have a 'TimingWindow' specific API call
    that returns the desired list via a hook.
     */

    return (
        <Grid  columns={5}>
            <Grid.Col span={{base: 5, lg: 2}}>
                <Fieldset legend={"Target and type"}>
                    <TargetTypeForm {...props}/>
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={{base: 5, lg: 3}}>
                <Fieldset legend={"Timing windows"}>
                    <TimingWindowsForm
                        observationId={props.observationId}
                        timingWindows={props.observation?.constraints!}/>
                </Fieldset>
            </Grid.Col>
        </Grid>
    )
}