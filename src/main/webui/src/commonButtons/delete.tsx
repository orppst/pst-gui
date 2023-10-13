import {ActionIcon, Tooltip} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

export default function DeleteButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip position="left" openDelay={1000}  label={props.toolTipLabel}>
            <ActionIcon
                color={"red.5"}
                variant={"subtle"}
                onClick={props.onClick}
            >
                <IconTrash size={"2rem"}/>
            </ActionIcon>
        </Tooltip>
    )
}