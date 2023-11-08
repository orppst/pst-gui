import {ActionIcon, Tooltip} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

export default function DeleteButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip position="left"
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}
                 label={props.toolTipLabel}>
            <ActionIcon
                color={"red.5"}
                variant={"subtle"}
                onClick={props.onClick}
            >
                <IconTrash size={ICON_SIZE}/>
            </ActionIcon>
        </Tooltip>
    )
}