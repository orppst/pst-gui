import { Button, Tooltip } from '@mantine/core';
import {IconDeviceFloppy} from "@tabler/icons-react";
import {
    BasicButtonInterfaceProps,
    ClickButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';

/**
 * creates a submit button in the form of a Mantine ActionIcon displaying a
 * floppy disk. This is the only button with a type=submit and so does
 * not require an 'onClick()' function.
 *
 *
 * @param {BasicButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the submit button
 * @constructor
 */
export function SubmitButton(props: BasicButtonInterfaceProps): ReactElement {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconDeviceFloppy size={"2rem"}/>}
                    color={"violet.5"}
                    variant={"subtle"}
                    type="submit"
                    disabled={props.disabled}>
                {props.label === undefined? 'Submit' : props.label}
            </Button>
        </Tooltip>
    )
}

/**
 * Returns a save button in the form of a Mantine ActionIcon displaying a
 * floppy disk - use in place of a SubmitButton when a submit is not appropriate
 *
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the submit button
 * @constructor
 */
export function SaveButton(props: ClickButtonInterfaceProps): ReactElement {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconDeviceFloppy size={"2rem"}/>}
            color={"violet.5"}
            variant={"subtle"}
            onClick={props.onClick === undefined?
                props.onClickEvent :
                props.onClick}
            disabled={props.disabled}>
                {props.label === undefined? 'Save' : props.label}
            </Button>
        </Tooltip>
    )
}