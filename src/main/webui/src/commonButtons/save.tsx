import {ActionIcon, Tooltip} from "@mantine/core";
import {IconDeviceFloppy} from "@tabler/icons-react";

export default function SaveButton(props: {toolTipLabel: string}) {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <ActionIcon
                color={"violet.5"}
                variant={"subtle"}
                type="submit"
            >
                <IconDeviceFloppy size={"2rem"}/>
            </ActionIcon>
        </Tooltip>
    )
}