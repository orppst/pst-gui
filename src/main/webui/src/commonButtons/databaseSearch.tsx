import { Button, Tooltip } from '@mantine/core';
import { IconDatabaseSearch } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

/**
 * creates a database button.
 *
 * @param {ClickButtonInterfaceProps} props the input data to this button
 * @return {ReactElement} the dynamic HTML for the database interface button
 * @constructor
 */
export default
function DatabaseSearchButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            label={props.toolTipLabel}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconDatabaseSearch size={ICON_SIZE}/>}
                color={"green.5"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
            >
                {props.label ?? 'Search'}
            </Button>
        </Tooltip>
    )
}