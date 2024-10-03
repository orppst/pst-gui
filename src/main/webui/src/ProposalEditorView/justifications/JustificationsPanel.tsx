import {ReactElement} from "react";
import {useParams} from "react-router-dom";
import {
    useJustificationsResourceGetJustification,
} from "src/generated/proposalToolComponents.ts";
import {JSON_SPACES} from "src/constants.tsx";
import {Justification} from "src/generated/proposalToolSchemas.ts";
import JustificationsTable from "./justifications.table.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"

//no need to use an array, only two "kinds" of Justification 'scientific' and 'technical'
export type JustificationKinds = {
    scientific: Justification,
    technical: Justification
}

export default function JustificationsPanel() : ReactElement {

    const { selectedProposalCode } = useParams();

    const {
        data : scientific,
        error : scientificError,
        isLoading : scientificIsLoading,
    } = useJustificationsResourceGetJustification(
        { pathParams: { proposalCode: Number(selectedProposalCode), which: "scientific" } }
    );

    const {
        data : technical,
        error : technicalError,
        isLoading : technicalIsLoading,
    } = useJustificationsResourceGetJustification(
        { pathParams: { proposalCode: Number(selectedProposalCode), which: "technical" } }
    );


    if (scientificError) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(scientificError, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    if (technicalError) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(technicalError, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }
    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Justifications"} />
            <ContextualHelpButton messageId="MaintJustList" />
            {scientificIsLoading || technicalIsLoading ? (`Loading justifications...`) :
                <JustificationsTable scientific={scientific!} technical={technical!} />
            }
        </PanelFrame>
    )
}