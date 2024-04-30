import {Badge, Title} from "@mantine/core";
import {ReactElement} from "react";
import {
    useProposalCyclesResourceGetProposalCycleTitle,
    useProposalResourceGetObservingProposalTitle
} from "../generated/proposalToolComponents.ts";

interface titleInterfaceProps {
    isLoading?: boolean
    itemName: string
    panelTitle: string
}

interface editorPanelTitleInterfaceProps {
    proposalCode: number
    panelTitle: string
}

interface managerPanelTitleInterfaceProps {
    proposalCycleCode: number
    panelTitle: string
}

export function PanelTitle(props: titleInterfaceProps): ReactElement {
    return (
        <Title order={3}>
            { props.isLoading ?
                <Badge size={"xl"} radius={0}>...</Badge> :
                <Badge size={"xl"} radius={0}>{props.itemName}</Badge>
            } : {props.panelTitle}
        </Title>);
}

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
