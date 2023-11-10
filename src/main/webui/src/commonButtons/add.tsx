import {ActionIcon, Tooltip} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps";

export default function AddButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <ActionIcon
                color={"green.5"}
                variant={'subtle'}
                onClick={props.onClick}
            >
                <IconPlus size={"2rem"}/>
            </ActionIcon>
        </Tooltip>
    )
}