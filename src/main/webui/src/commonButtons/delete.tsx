import { Button, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';


/**
 * creates a delete button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the delete button
 * @constructor
 */
export default
function DeleteButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            label={props.toolTipLabel}
        >
            <Button
                rightSection={<IconTrash size={ICON_SIZE}/>}
                color={"red.7"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
            >
                {props.label ?? 'Delete'}
            </Button>
        </Tooltip>
    )
}