import {ReactElement} from "react";
import {Text} from "@mantine/core";

export default
function ObservationModeDetailsSelect() : ReactElement {
    return(
        <Text>
            For cycles with more than 5 modes. Here we have inputs for instruments, backends, and filters to narrow down the number of available observing modes.
        </Text>
    )
}