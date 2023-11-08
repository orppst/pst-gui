import {ActionIcon, Tooltip} from "@mantine/core";
import {IconCopy} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

export default function CloneButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}
                 label={props.toolTipLabel}>
            <ActionIcon
                color={"blue"}
                variant={"subtle"}
                onClick={props.onClick}
            >
                <IconCopy size={ICON_SIZE}/>
            </ActionIcon>
        </Tooltip>
    )
}