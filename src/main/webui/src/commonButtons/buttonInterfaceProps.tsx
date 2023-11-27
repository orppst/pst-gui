/*
Input property for common buttons:
- tool tip label string
- onClick function (optional)
 */
import { SyntheticEvent } from 'react';
import { TablerIconsProps } from '@tabler/icons-react';

/**
 * basic button interface props. Used by Submit button.
 *
 * @param {string} toolTipLabel the label shown when hovered.
 * @param {boolean} disabled is the button disabled.
 * @param {string} label the text shown next to the buttons icon.
 */
export interface BasicButtonInterfaceProps {
    toolTipLabel: string
    disabled?: boolean
    label?: string
}

/**
 * used by any button with a specific click function.
 *
 * @param {(event: SyntheticEvent) => void}} onClickEvent click event
 * that requires a SyntheticEvent input.
 * @param {() => void} onClick event for when the button is clicked with no data.
 */
export interface ClickButtonInterfaceProps extends BasicButtonInterfaceProps {
    onClickEvent?: (event: SyntheticEvent) => void
    onClick?: () => void
}

/**
 * used by the download document button.
 *
 * @param {string} download: the downloaded file name.
 * @param {string} href: the link for where the file is.
 */
export interface DownloadButtonInterfaceProps extends BasicButtonInterfaceProps {
    download: string
    href: string
}

/**
 * used by the download request button.
 *
 * @param {string} download the downloaded file name.
 * @param {() => void}} onClick the function to call when clicked.
 */
export interface DownloadRequestInterfaceProps extends BasicButtonInterfaceProps {
    download: string
    onClick?: () => void
}

/**
 * used to route users around the form from other pages.
 *
 * @param {number} p ??????
 * @param {number} ml ????
 * @param {string} to the destination to route the user to when clicked.
 * @param {(props: TablerIconsProps) => JSX.Element} icon the mantine icon to
 * present.
 */
export interface NavigationButtonInterfaceProps
        extends BasicButtonInterfaceProps {
    p: number
    ml: number
    to: string
    icon: (props: TablerIconsProps) => JSX.Element
}
