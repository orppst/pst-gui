import { Button, Tooltip } from '@mantine/core';
import { NavigationButtonInterfaceProps } from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

/**
 * creates a navigation button.
 *
 * @param {NavigationButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the navigation button
 * @constructor
 */
export default function NavigationButton(props: NavigationButtonInterfaceProps):
    ReactElement {
    return (
        <Tooltip position={"left"}
                 label={props.toolTipLabel}
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}>
            <Button rightSection={<props.icon size={ICON_SIZE}/>}
                    p={props.p}
                    ml={props.ml}
                    to={props.to}
                    component={Link}
                    variant={"subtle"}
                    disabled={props.disabled}>
                {props.label === undefined? 'unnamed route' : props.label}
            </Button>
        </Tooltip>
    )
}