import {ObservationNewForm} from "./new.form.tsx";
import ViewEditTimingWindows from "./ViewEditTimingWindows.tsx";
import {ObservationTargetProps} from "./List.tsx";

/*
  We may want to do this in tabs, there's a significant amount of detail for one page:

  1. select target and observation type
  2. set technical goals and the "field"
  3. select timing-windows
 */

export default function ObservationEditForm(props: ObservationTargetProps){

    //target and type (and field??)
    //technical goals
    //timing windows
    return (
        <>
            <ObservationNewForm
                {...props}
            />
            <ViewEditTimingWindows/>
        </>
    )
}