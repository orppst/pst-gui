import ViewEditPerformanceParameters from "./performance.form.tsx";
import ViewEditSpectralWindow from "./spectrum.form.tsx";
import {Button, Group, Text, Box} from "@mantine/core";
import {TechnicalGoalClose} from "./Goals.tsx";

export default function TechnicalGoalParentForm( props: TechnicalGoalClose ) {

    //for a new TechnicalGoal we only allow setting the performance parameters.
    // The spectral windows can be added after via the edit button (which also takes
    // this route but with goal != undefined)

/*

 */

    return (
        <>
            <ViewEditPerformanceParameters {...props.goal?.performance} />
            {
                props.goal ?
                    <>
                        {
                            props.goal?.spectrum?.length! > 0 ?
                            props.goal?.spectrum?.map((s) => {
                                return <ViewEditSpectralWindow {...s} />
                            }) :
                                <ViewEditSpectralWindow/>
                        }
                        <Group position={"right"}>
                            <Button onClick={props.close}>Done</Button>
                        </Group>
                    </> :
                    <Group position={"center"}>
                        <Text color={"pink.5"} maw={300} align={"center"} size={"xs"}>
                            Creation of a new Technical Goal is done with the performance
                            parameters only. Spectral windows can be added after creation
                            using the view/edit button
                        </Text>
                    </Group>
            }
        </>
    )
}