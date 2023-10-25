/*
Input property for common buttons:
- tool tip label string
- onClick function (optional)
 */
export interface ButtonInterfaceProps {
    toolTipLabel: string
    onClick?: ()=>void
}