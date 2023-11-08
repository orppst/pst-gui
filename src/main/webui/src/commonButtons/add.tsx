import {ActionIcon, Tooltip} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";
import {ButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

export default function AddButton(props: ButtonInterfaceProps) {
    return (
        <Tooltip position={"left"}
                 label={props.toolTipLabel}
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}>
            <ActionIcon
                color={"green.5"}
                variant={'subtle'}
                onClick={props.onClick}
            >
                <IconPlus size={ICON_SIZE}/>
            </ActionIcon>
        </Tooltip>
    )
}