import {ReactElement} from "react";
import {Alert} from "@mantine/core";
import {IconInfoHexagon} from "@tabler/icons-react";
import getErrorMessage from "./getErrorMessage.tsx";

export default
function AlertErrorMessage(props: {title: string, error: unknown}): ReactElement {
    return (
        <Alert
            variant={"light"}
            color={"red"}
            title={props.title}
            icon={<IconInfoHexagon/>}
        >
            {getErrorMessage(props.error)}
        </Alert>
    )
}