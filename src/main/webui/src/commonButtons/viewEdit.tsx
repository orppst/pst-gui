import { Button, Tooltip } from '@mantine/core';
import { IconEyeEdit } from '@tabler/icons-react';
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

export default function ViewEditButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip openDelay={1000} label={props.toolTipLabel}>
            <Button rightSection={<IconEyeEdit size={"2rem"}/>}
                    color={"green"}
                    variant={"subtle"}
                    onClick={props.onClick}
                    disabled={props.disabled}>
                Edit
            </Button>
        </Tooltip>
    )
}