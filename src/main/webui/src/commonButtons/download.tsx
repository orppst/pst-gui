import { Button, Tooltip } from '@mantine/core';
import { IconDatabaseSearch, IconFileDownload } from '@tabler/icons-react';
import {
    DownloadButtonInterfaceProps,
    DownloadRequestInterfaceProps
} from './buttonInterfaceProps.tsx';
import { ReactElement } from 'react';

/**
 * creates a download button.
 *
 * @param {DownloadButtonInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the download button
 * @constructor
 */
export function DownloadButton(props: DownloadButtonInterfaceProps):
        ReactElement {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconFileDownload size={"2rem"}/>}
                    color={"green"}
                    variant={"subtle"}
                    component={"a"}
                    download={props.download}
                    href={props.href}
                    disabled={props.disabled}>
                {props.label === undefined? 'Download' : props.label}
            </Button>
        </Tooltip>
    )
}


/**
 * creates a request download button.
 *
 * @param {DownloadRequestInterfaceProps} props the button inputs.
 * @return {ReactElement} the dynamic html for the download button
 * @constructor
 */
export function DownloadRequestButton(props: DownloadRequestInterfaceProps):
    ReactElement {
    return (
        <Tooltip position={"left"} label={props.toolTipLabel} openDelay={1000}>
            <Button rightSection={<IconDatabaseSearch size={"2rem"}/>}
                    color={"blue"}
                    variant={"subtle"}
                    component={"a"}
                    download={props.download}
                    onClick={props.onClick}
                    disabled={props.disabled}>
                {props.label === undefined? 'Request download' : props.label}
            </Button>
        </Tooltip>
    )
}