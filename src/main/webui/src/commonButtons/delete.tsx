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
export default function DeleteButton(props: ClickButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip position="left"
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}
                 label={props.toolTipLabel}>
            <Button rightSection={<IconTrash size={ICON_SIZE}/>}
                    color={"red.5"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined?
                        props.onClickEvent :
                        props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'Delete' : props.label}
            </Button>
        </Tooltip>
    )
}