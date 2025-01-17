import {ReactElement, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    fetchJustificationsResourceGetJustification,
} from "src/generated/proposalToolComponents.ts";
import {Justification} from "src/generated/proposalToolSchemas.ts";
import JustificationsTable from "./justifications.table.tsx";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

//no need to use an array, only two "kinds" of Justification 'scientific' and 'technical'
export type JustificationKinds = {
    scientific: Justification,
    technical: Justification
}

export type WhichJustification = 'scientific' | 'technical';

export default function JustificationsPanel() : ReactElement {

    const { selectedProposalCode } = useParams();

    const [isChanged, setIsChanged] = useState<boolean>(false);

    const { fetcherOptions } = useProposalToolContext();

    const [justifications, setJustifications] = useState<JustificationKinds>({
        scientific: {text: "", format: undefined},
        technical: {text: "", format: undefined}
    })

    useEffect(() => {
        fetchJustificationsResourceGetJustification({
            ...fetcherOptions,
            pathParams: {proposalCode: Number(selectedProposalCode), which: "scientific"}
        })
            .then((scientific) => {
                fetchJustificationsResourceGetJustification({
                    ...fetcherOptions,
                    pathParams: {proposalCode: Number(selectedProposalCode), which: "technical"}
                })
                    .then ((technical) => {
                        setJustifications({scientific: scientific, technical: technical})
                    })
                    .catch((error) =>
                        notifyError("Fetch fail 'technical", getErrorMessage(error))
                    )
            })
            .catch(
                (error) =>
                    notifyError("Fetch fail 'scientific", getErrorMessage(error))
            )
    }, [isChanged]);

    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Justifications"} />
            <ContextualHelpButton messageId="MaintJustList" />
            <JustificationsTable
                justifications={justifications}
                onChange={() => setIsChanged(!isChanged)}
            />
        </PanelFrame>
    )
}