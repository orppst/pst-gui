import { Button, Tooltip } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import { ReactElement } from 'react';

/**
 * creates a clone button.
 *
 * @param {ButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the clone button
 * @constructor
 */
export default function CloneButton(props: ButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip openDelay={1000} label={props.toolTipLabel}>
            <Button rightSection={<IconCopy size={"2rem"}/>}
                    color={"blue"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined?
                        props.onClickEvent :
                        props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'Copy' : props.label}
            </Button>
        </Tooltip>
    )
}