import { Button, Tooltip } from '@mantine/core';
import { IconUserPentagon } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';


/**
 * creates a swap role button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the delete button
 * @constructor
 */
export default
function SwapRoleButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            label={props.toolTipLabel}
        >
            <Button
                rightSection={<IconUserPentagon size={ICON_SIZE}/>}
                color={"green.5"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
                //type="submit"
            >
                {props.label ?? 'Swap Role'}
            </Button>
        </Tooltip>
    )
}
