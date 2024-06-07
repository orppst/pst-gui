import { Button, Tooltip } from '@mantine/core';
import { IconEyeEdit } from '@tabler/icons-react';
import { ClickButtonInterfaceProps } from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';


/**
 * creates a view/edit button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the view/edit button
 * @constructor
 */
export default
function ViewEditButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            label={props.toolTipLabel}
        >
            <Button
                rightSection={<IconEyeEdit size={ICON_SIZE}/>}
                color={"teal.6"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
            >
                {props.label ?? 'Edit'}
            </Button>
        </Tooltip>
    )
}