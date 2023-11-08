import { Button, Tooltip } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

export default function CloneButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip openDelay={1000} label={props.toolTipLabel}>
            <Button rightSection={<IconCopy size={"2rem"}/>}
                    color={"blue"}
                    variant={"subtle"}
                    onClick={props.onClick}
                    disabled={props.disabled}>
                Copy
            </Button>
        </Tooltip>
    )
}