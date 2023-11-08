import { Button, Tooltip } from '@mantine/core';
import {IconDeviceFloppy} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";

/*
Returns a form submit button in the form of a Mantine ActionIcon displaying a floppy disk

props: input consists of a string variable for the tool tip label, and a boolean for the disabled state

Notice: this is a 'submit' type button for a form and does not require an 'onClick()' function
 */
export function SubmitButton(props: { toolTipLabel: string, disabled?: boolean }) {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconDeviceFloppy size={"2rem"}/>}
                    color={"violet.5"}
                    variant={"subtle"}
                    type="submit"
                    disabled={props.disabled}>
                Submit
            </Button>
        </Tooltip>
    )
}

/*
Returns a save button in the form of a Mantine ActionIcon displaying a floppy disk - use in place of a
SubmitButton when a submit is not appropriate

props:  string variable for the tool tip label,
        a boolean for the disabled state,
        an onClick() function.
 */
export function SaveButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconDeviceFloppy size={"2rem"}/>}
            color={"violet.5"}
            variant={"subtle"}
            type="submit"
            disabled={props.disabled}>
                Save
            </Button>
        </Tooltip>
    )
}