import {ClickButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import {ReactElement} from "react";
import {Button, Tooltip} from "@mantine/core";
import {CLOSE_DELAY, ICON_SIZE, OPEN_DELAY} from "../constants.tsx";
import {IconDownload} from "@tabler/icons-react";

export
function ExportButton(props: ClickButtonInterfaceProps) : ReactElement {
    return (
        <Tooltip position={props.toolTipLabelPosition ?? "left"}
                 label={props.toolTipLabel}
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}
        >
            <Button
                rightSection={<IconDownload size={ICON_SIZE}/>}
                color={"grape.7"}
                variant={props.variant ?? "subtle"}
                onClick={props.onClick === undefined? props.onClickEvent : props.onClick}
                disabled={props.disabled}>
                {props.label === undefined? 'Export' : props.label}
            </Button>
        </Tooltip>
    )
}