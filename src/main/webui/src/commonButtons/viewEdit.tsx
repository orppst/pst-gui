import {ActionIcon, Tooltip} from "@mantine/core";
import {IconEyeEdit} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

export default function ViewEditButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}
                 label={props.toolTipLabel}>
            <ActionIcon
                color={"green"}
                variant={"subtle"}
                onClick={props.onClick}
            >
                <IconEyeEdit size={ICON_SIZE}/>
            </ActionIcon>
        </Tooltip>
    )
}