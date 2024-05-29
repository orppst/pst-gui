import {ReactElement} from "react";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {useProposalResourceGetObservingProposal} from "../../generated/proposalToolComponents.ts";
import ObservationFieldsTable from "./observationFieldsTable.tsx";
import {Field} from "../../generated/proposalToolSchemas.ts";
import ObservationFieldModal from "./observationFields.modal.tsx";
import {Group, Space} from "@mantine/core";

export type ObservationFieldsProps = {
    observationField: Field | undefined
    closeModal?: () => void
}



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

            <Space h={"xl"}/>

            <Group justify={'center'}>
                <ObservationFieldModal observationField={undefined} />
            </Group>

        </PanelFrame>
    )
}