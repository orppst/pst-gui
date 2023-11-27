import { Button, Tooltip } from '@mantine/core';
import {  IconFileSearch } from '@tabler/icons-react';
import { ClickButtonInterfaceProps} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';
import { CLOSE_DELAY, ICON_SIZE, OPEN_DELAY } from '../constants.tsx';

/**
 * creates an upload button.
 *
 * @param {ClickButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the upload button
 * @constructor
 */
export default function UploadButton(props: ClickButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip position={"left"}
                 label={props.toolTipLabel}
                 openDelay={OPEN_DELAY}
                 closeDelay={CLOSE_DELAY}>
            <Button rightSection={<IconFileSearch size={ICON_SIZE}/>}
                    color={"violet.5"}
                    variant={"subtle"}
                    onClick={props.onClick === undefined?
                        props.onClickEvent :
                        props.onClick}
                    disabled={props.disabled}>
            {props.label === undefined? 'Choose a file' : props.label}
            </Button>
        </Tooltip>
    )
}