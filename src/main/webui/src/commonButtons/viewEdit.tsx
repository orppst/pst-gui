import { Button, Tooltip } from '@mantine/core';
import { IconEyeEdit } from '@tabler/icons-react';
import { ClickButtonInterfaceProps } from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';

/**
 * creates a view/edit button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the view/edit button
 * @constructor
 */
export default function ViewEditButton(props: ClickButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip openDelay={1000} label={props.toolTipLabel}>
            <Button rightSection={<IconEyeEdit size={"2rem"}/>}
                    color={"green"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined?
                        props.onClickEvent :
                        props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'edit' : props.label}
            </Button>
        </Tooltip>
    )
}