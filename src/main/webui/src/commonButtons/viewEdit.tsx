import {ActionIcon, Tooltip} from "@mantine/core";
import {IconEyeEdit} from "@tabler/icons-react";

export default function ViewEditButton(props: {toolTipLabel: string, onClick?: () => void}) {
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