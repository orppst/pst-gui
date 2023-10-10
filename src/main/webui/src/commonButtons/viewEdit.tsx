import {ActionIcon, Tooltip} from "@mantine/core";
import {IconEyeEdit} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

export default function ViewEditButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip openDelay={1000} label={props.toolTipLabel}>
            <ActionIcon
                color={"green"}
                variant={"subtle"}
                onClick={props.onClick}
            >
                <IconEyeEdit size={"2rem"}/>
            </ActionIcon>
        </Tooltip>
    )
}