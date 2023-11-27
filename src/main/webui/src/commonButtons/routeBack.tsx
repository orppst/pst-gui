import { Button, Tooltip } from '@mantine/core';
import { IconAlignLeft } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

/**
 * creates a routing back button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the routing back button
 * @constructor
 */
export default function RouteBackButton(props: ClickButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip position={"left"}
                 label={props.toolTipLabel}
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}>
            <Button rightSection={<IconAlignLeft size={ICON_SIZE}/>}
                    color={"green.5"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined?
                        props.onClickEvent :
                        props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'finished editing' : props.label}
            </Button>
        </Tooltip>
    )
}