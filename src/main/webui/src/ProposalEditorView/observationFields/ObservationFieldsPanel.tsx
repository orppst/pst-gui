import {ReactElement} from "react";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {useProposalResourceGetObservingProposal} from "../../generated/proposalToolComponents.ts";
import ObservationFieldsTable from "./observationFieldsTable.tsx";

export default function ObservationFieldsPanel() : ReactElement {

    const {selectedProposalCode} = useParams();

    const proposal = useProposalResourceGetObservingProposal({
        pathParams:{proposalCode: Number(selectedProposalCode)}
    })


    return (
        <PanelFrame>
            <PanelHeader
                isLoading={proposal.isLoading}
                itemName={proposal.data?.title!}
                panelHeading={"Observation Fields"}
            />

            <ObservationFieldsTable/>

        </PanelFrame>
    )
}