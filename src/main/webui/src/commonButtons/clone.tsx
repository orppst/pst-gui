import {ActionIcon, Tooltip} from "@mantine/core";
import {IconCopy} from "@tabler/icons-react";

export default function CloneButton(props: {toolTipLabel: string, onClick?: () => void}) {
    return (
        <Tooltip openDelay={1000} label={props.toolTipLabel}>
            <ActionIcon
                color={"blue"}
                variant={"subtle"}
                onClick={props.onClick}
            >
                <IconCopy size={"2rem"}/>
            </ActionIcon>
        </Tooltip>
    )
}