import {ReactElement} from "react";
import {Alert, Container} from "@mantine/core";
import {IconInfoHexagon} from "@tabler/icons-react";
import getErrorMessage from "./getErrorMessage.tsx";

export default
function AlertErrorMessage(props: {title: string, error: unknown}): ReactElement {
    return (
        <Container m={"xl"}>
            <Alert
                variant={"light"}
                color={"red"}
                title={"Error: " + props.title}
                icon={<IconInfoHexagon/>}
            >
                {getErrorMessage(props.error)}
            </Alert>
        </Container>
    )
}