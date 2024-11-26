import { Button, Tooltip } from '@mantine/core';
import {IconDeviceFloppy} from "@tabler/icons-react";
import {
    BasicButtonInterfaceProps,
    ClickButtonInterfaceProps, FormSubmitButtonInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

/**
 * creates a submit button in the form of a Mantine ActionIcon displaying a
 * floppy disk. This button has a type=submit and so does
 * not require an 'onClick()' function.  It also takes form parameter that
 * is used to automatically enable the button and provide a tool tip context
 * for when it is disabled.
 *
 * @param {BasicButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the submit button
 * @constructor
 */
export
function FormSubmitButton(props: FormSubmitButtonInterfaceProps): ReactElement {
    const label = props.label ?? 'Save';
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            label={
                props.form.isValid()?
                    props.form.isDirty()?
                        props.toolTipLabel ?? label
                        :"No values have changed"
                    : "All fields must be complete and valid"
            }
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconDeviceFloppy size={ICON_SIZE}/>}
                color={"indigo.5"}
                variant={props.variant ?? "subtle"}
                type="submit"
                disabled={!props.form.isValid() || !props.form.isDirty()}
            >
                {label}
            </Button>
        </Tooltip>
    )
}



/**
 * creates a submit button in the form of a Mantine ActionIcon displaying a
 * floppy disk. This button has a type=submit and so does
 * not require an 'onClick()' function.
 *
 *
 * @param {BasicButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the submit button
 * @constructor
 */
export
function SubmitButton(props: BasicButtonInterfaceProps): ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            label={props.toolTipLabel}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconDeviceFloppy size={ICON_SIZE}/>}
                color={"indigo.5"}
                variant={props.variant ?? "subtle"}
                type="submit"
                disabled={props.disabled}
            >
                {props.label ?? 'Save'}
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
        <Tooltip position={props.toolTipLabelPosition ?? "left"}
                 label={props.toolTipLabel}
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconDeviceFloppy size={ICON_SIZE}/>}
                color={"blue.7"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick === undefined? props.onClickEvent : props.onClick}
                disabled={props.disabled}>
                {props.label === undefined? 'Save' : props.label}
            </Button>
        </Tooltip>
    )
}