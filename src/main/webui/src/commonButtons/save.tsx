import {ActionIcon, Tooltip} from "@mantine/core";
import {IconDeviceFloppy} from "@tabler/icons-react";

/*
Returns a form submit (or save) button in the form of a Mantine ActionIcon displaying a floppy disk

props: input consists of a string variable for the tool tip label,

Notice: this is a 'submit' type button for a form
 */
export default function SaveButton(props: { toolTipLabel: string }) {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <ActionIcon
                color={"violet.5"}
                variant={"subtle"}
                type="submit"
            >
                <IconDeviceFloppy size={"2rem"}/>
            </ActionIcon>
        </Tooltip>
    )
}