import { Button, Tooltip } from '@mantine/core';
import {IconDeviceFloppy} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import { ReactElement } from 'react';

/**
 * creates a submit button in the form of a Mantine ActionIcon displaying a
 * floppy disk. This is the only button with a type=submit and so does
 * not require an 'onClick()' function.
 *
 *
 * @param {ButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the submit button
 * @constructor
 */
export function SubmitButton(props: ButtonInterfaceProps) {
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
 * @param {ButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the submit button
 * @constructor
 */
export function SaveButton(props: ButtonInterfaceProps): ReactElement {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconDeviceFloppy size={"2rem"}/>}
            color={"violet.5"}
            variant={"subtle"}
            type="submit"
            disabled={props.disabled}>
                {props.label === undefined? 'Save' : props.label}
            </Button>
        </Tooltip>
    )
}