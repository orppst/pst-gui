import {ReactElement} from "react";
import {Group, Text} from "@mantine/core";
import getErrorMessage from "./getErrorMessage.tsx";

export default
function TextErrorMessage(props: {error: unknown, preamble?: string }) : ReactElement {
    return (
        <Group>
            {
                props.preamble &&
                <Text c={"red"}>{props.preamble}</Text>
            }
            <Text c={"red"}>{getErrorMessage(props.error)}</Text>
        </Group>

    )
}