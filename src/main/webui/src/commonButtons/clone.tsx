import { Button, Tooltip } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';


/**
 * creates a clone button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the clone button
 * @constructor
 */
export default
function CloneButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            label={props.toolTipLabel}
        >
            <Button
                rightSection={<IconCopy size={ICON_SIZE}/>}
                color={"blue"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
            >
                {props.label ?? 'Copy'}
            </Button>
        </Tooltip>
    )
}