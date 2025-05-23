import {
    Badge, Container,
    ContainerProps,
    Title,
} from "@mantine/core";
import {ReactElement} from "react";
import {
    useProposalCyclesResourceGetProposalCycleTitle,
    useProposalResourceGetObservingProposalTitle
} from "../generated/proposalToolComponents.ts";

import {headerInterfaceProps, editorPanelHeaderInterfaceProps, managerPanelHeaderInterfaceProps} from "./panelFeatureInterfaceProps.tsx";


/**
 * Render a panel title or ellipsis if still loading.
 * @param {headerInterfaceProps} props
 */
export function PanelHeader(props: headerInterfaceProps): ReactElement {
    return (
        <Title order={3} styles={{root: { marginBottom: 10, marginTop: 10}}}>
            { props.isLoading ?
                <Badge size={"xl"} radius={0}>...</Badge> :
                <Badge size={"xl"} radius={0}>{props.itemName}</Badge>
            }
            {
                props.panelHeading &&
                <Badge
                    size={"xl"}
                    radius={0}
                    bg={"gray.7"}
                >
                    {props.panelHeading}
                </Badge>
            }
        </Title>);
}

/**
 * Lookup a proposal title then call PanelTitle() to render
 * @param {editorPanelHeaderInterfaceProps} props
 */
export function EditorPanelHeader(props: editorPanelHeaderInterfaceProps) {
    const {data, error, isLoading} =
        useProposalResourceGetObservingProposalTitle(
            {pathParams: {proposalCode: props.proposalCode,
                          doInvestigatorCheck: true}});

    if(error) {
        return (
            <Title order={3}>
                <Badge size={"xl"} radius={0}>UNKNOWN</Badge>
                : {props.panelHeading}
            </Title>
        );
    }

    return (<PanelHeader
        isLoading={isLoading}
        itemName={data as unknown as string}
        panelHeading={props.panelHeading} />);

}

/**
 * Lookup an observing cycle title then call PanelTitle() to render
 * @param {managerPanelHeaderInterfaceProps} props
 */
export function ManagerPanelHeader(props: managerPanelHeaderInterfaceProps) {
    const {data, error, isLoading} =
        useProposalCyclesResourceGetProposalCycleTitle(
            {pathParams: {cycleCode: props.proposalCycleCode}});

    if(error) {
        return (
            <Title order={3}>
                <Badge size={"xl"} radius={0}>UNKNOWN</Badge>
                : {props.panelHeading}
            </Title>
        );
    }

    return (<PanelHeader
        isLoading={isLoading}
        itemName={data as unknown as string}
        panelHeading={props.panelHeading} />);

}

/**
 * A wrapper element for whatever we want to use to contain the contents of each panel
 * this is a Mantine Container, but can easily be modified here to be a different
 * component or have default properties, such as 'fluid'
 */

export function PanelFrame(props: ContainerProps): ReactElement {
    return (
        <Container fluid {...props} />
    );
}
