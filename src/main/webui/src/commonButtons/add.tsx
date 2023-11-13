import { Button, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';

/**
 * creates an add button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the add button
 * @constructor
 */
export default function AddButton(props: ClickButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconPlus size={"2rem"}/>}
                    color={"green.5"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined?
                        props.onClickEvent :
                        props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'Add' : props.label}
            </Button>
        </Tooltip>
    )
}