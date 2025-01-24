import {ReactElement} from "react";
import {useParams} from "react-router-dom";
import {
    useJustificationsResourceGetJustification,
} from "src/generated/proposalToolComponents.ts";
import JustificationsTable from "./justifications.table.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {Loader} from "@mantine/core";

export type WhichJustification = 'scientific' | 'technical';

export default function JustificationsPanel() : ReactElement {

    const { selectedProposalCode } = useParams();

    const scientificJustification = useJustificationsResourceGetJustification({
        pathParams: {proposalCode: Number(selectedProposalCode), which: 'scientific'}
    })

    const technicalJustification = useJustificationsResourceGetJustification({
        pathParams: {proposalCode: Number(selectedProposalCode), which: 'technical'}
    })

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Justifications"} />
            <ContextualHelpButton messageId="MaintJustList" />
            {
                scientificJustification.isLoading || technicalJustification.isLoading ?
                    <Loader /> : <JustificationsTable
                        scientific={scientificJustification.data!}
                        technical={technicalJustification.data!} />
            }
        </PanelFrame>
    )
}