import {ReactElement} from "react";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {useProposalResourceGetObservingProposal} from "../../generated/proposalToolComponents.ts";
import ObservationFieldsTable from "./observationFieldsTable.tsx";
import {Field} from "../../generated/proposalToolSchemas.ts";
import ObservationFieldModal from "./observationFields.modal.tsx";
import {Badge, Card, Group, Space, Text} from "@mantine/core";

export type ObservationFieldsProps = {
    observationField: Field | undefined
    closeModal?: () => void
}

export type ObservationFieldsTableProps = {
    boundFields: number[] | undefined
}

export default function ObservationFieldsPanel() : ReactElement {

    const {selectedProposalCode} = useParams();

    const proposal = useProposalResourceGetObservingProposal({
        pathParams:{proposalCode: Number(selectedProposalCode)}
    })


    let boundFields : number[] | undefined;
    boundFields = proposal.data?.observations?.map(obs => (
        obs.field! as number)
    )

    //Remove the "Card" once we have this fully implemented

    return (
        <PanelFrame>
            <PanelHeader
                isLoading={proposal.isLoading}
                itemName={proposal.data?.title!}
                panelHeading={"Observation Fields"}
            />

            <Group justify={"center"}>
                <Card shadow={"sm"} padding={"xs"} radius={"md"} withBorder w={"60%"} m={"lg"}>
                    <Card.Section>
                        <Badge bg={"blue"} radius={0}>
                            Prototype Version: Observation Fields not fully implemented
                        </Badge>
                    </Card.Section>
                    <Text c={"pink"} size={"sm"}>
                        Presently you can define a "TargetField" that takes a name input only.
                        Other "Field" types will be added in due time.
                    </Text>
                </Card>
            </Group>

            <ObservationFieldsTable boundFields={boundFields} />

            <Space h={"xl"}/>

            <Group justify={'center'}>
                <ObservationFieldModal observationField={undefined} />
            </Group>

        </PanelFrame>
    )
}