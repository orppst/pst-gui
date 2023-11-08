import { Button, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

export default function AddButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconPlus size={"2rem"}/>}
                    color={"green.5"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined? props.onClickEvent :props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'Add' : props.label}
            </Button>
        </Tooltip>
    )
}