import { Button, Tooltip } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import {
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';

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
        <Tooltip position="left" openDelay={1000}  label={props.toolTipLabel}>
            <Button rightSection={<IconTrash size={"2rem"}/>}
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