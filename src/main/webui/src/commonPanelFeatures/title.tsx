import {Badge, Title} from "@mantine/core";
import {ReactElement} from "react";
import {
    useProposalCyclesResourceGetProposalCycleTitle,
    useProposalResourceGetObservingProposalTitle
} from "../generated/proposalToolComponents.ts";

import {titleInterfaceProps, editorPanelTitleInterfaceProps, managerPanelTitleInterfaceProps} from "./panelFeatureInterfaceProps.tsx";

/**
 * Render a panel title or ellipsis if still loading.
 * @param {titleInterfaceProps} props
 */
export function PanelTitle(props: titleInterfaceProps): ReactElement {
    return (
        <Title order={3}>
            { props.isLoading ?
                <Badge size={"xl"} radius={0}>...</Badge> :
                <Badge size={"xl"} radius={0}>{props.itemName}</Badge>
            } : {props.panelTitle}
        </Title>);
}

/**
 * Lookup a proposal title then call PanelTitle() to render
 * @param {editorPanelTitleInterfaceProps} props
 */
export function EditorPanelTitle(props: editorPanelTitleInterfaceProps) {
    const {data, error, isLoading} =
        useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: props.proposalCode}});

    if(error) {
        return (
            <Title order={3}>
                <Badge size={"xl"} radius={0}>UNKNOWN</Badge>
                : {props.panelTitle}
            </Title>
        );
    }

    return (<PanelTitle
        isLoading={isLoading}
        itemName={data as unknown as string}
        panelTitle={props.panelTitle} />);

}

/**
 * Lookup an observing cycle title then call PanelTitle() to render
 * @param {managerPanelTitleInterfaceProps} props
 */
export function ManagerPanelTitle(props: managerPanelTitleInterfaceProps) {
    const {data, error, isLoading} =
        useProposalCyclesResourceGetProposalCycleTitle(
            {pathParams: {cycleCode: props.proposalCycleCode}});

    if(error) {
        return (
            <Title order={3}>
                <Badge size={"xl"} radius={0}>UNKNOWN</Badge>
                : {props.panelTitle}
            </Title>
        );
    }

    return (<PanelTitle
        isLoading={isLoading}
        itemName={data as unknown as string}
        panelTitle={props.panelTitle} />);

}
