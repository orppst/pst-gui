import {ObservationNewForm} from "./new.form.tsx";
import ViewEditTimingWindows from "./ViewEditTimingWindows.tsx";
import {ObservationTargetProps} from "./List.tsx";
import {Fieldset, Grid} from "@mantine/core";

/*
  We may want to do this in tabs, there's a significant amount of detail for one page:

  1. select target and observation type
  2. set technical goals and the "field"
  3. select timing-windows
 */

export default function ObservationEditForm(props: ObservationTargetProps){

    //target and type (and field??)
    //timing windows
    return (
        <Grid columns={5}>
            <Grid.Col span={{base: 5, lg: 2}}>
                <Fieldset legend={"Target and type"}>
                    <ObservationNewForm
                        {...props}
                    />
                </Fieldset>
            </Grid.Col>
            <Grid.Col span={{base: 5, lg: 3}}>
                <Fieldset legend={"Timing windows"}>
                    <ViewEditTimingWindows/>
                </Fieldset>
            </Grid.Col>
        </Grid>
    )
}