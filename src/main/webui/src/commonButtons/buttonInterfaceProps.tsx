/*
Input property for common buttons:
- tool tip label string
- onClick function (optional)
 */
import { SyntheticEvent } from 'react';

export interface ButtonInterfaceProps {
    toolTipLabel: string
    disabled?: boolean
    onClick?: ()=>void
    onClickEvent?: (event: SyntheticEvent)=>void
    label?: string
}