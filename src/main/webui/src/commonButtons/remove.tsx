import {ClickButtonInterfaceProps} from "./buttonInterfaceProps.tsx";
import {ReactElement} from "react";
import {Button, Tooltip} from "@mantine/core";
import {CLOSE_DELAY, OPEN_DELAY} from "../constants.tsx";
import {IconX} from "@tabler/icons-react";

export default
function RemoveButton(props: ClickButtonInterfaceProps) : ReactElement {
    return (
        <Tooltip
            position={props.toolTipLabelPosition}
            openDelay={OPEN_DELAY}
            closeDelay={CLOSE_DELAY}
            label={props.toolTipLabel}
        >
            <Button
                rightSection={<IconX size={"1.5em"}/>}
                color={"red.5"}
                variant={"transparent"}
                onClick={props.onClick ?? props.onClickEvent}
                disabled={props.disabled}
            />
        </Tooltip>
    )
}