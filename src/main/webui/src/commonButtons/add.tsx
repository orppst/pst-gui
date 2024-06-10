import { Button, Tooltip } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';


/**
 * creates an add button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the add button
 * @constructor
 */
export default
function AddButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            label={props.toolTipLabel}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconPlus size={ICON_SIZE}/>}
                color={"green.5"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
            >
                {props.label ?? 'Add'}
            </Button>
        </Tooltip>
    )
}