import {ReactElement} from "react";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {useProposalResourceGetObservingProposal} from "../../generated/proposalToolComponents.ts";
import ObservationFieldsTable from "./observationFieldsTable.tsx";
import {Field} from "../../generated/proposalToolSchemas.ts";
import ObservationFieldModal from "./observationFields.modal.tsx";
import {Badge, Card, Grid, Group, Space, Text} from "@mantine/core";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"

export type ObservationFieldsProps = {
    observationField: Field | undefined
    fieldNames?: string[]
    closeModal?: () => void
}

export type ObservationFieldsTableProps = {
    boundFields: number[] | undefined
    fieldNames?: string[]
}

/**
 * Function to return the page elements for "Observation Fields"
 */
export default function ObservationFieldsPanel() : ReactElement {

    const {selectedProposalCode} = useParams();

    const proposal = useProposalResourceGetObservingProposal({
        pathParams:{proposalCode: Number(selectedProposalCode)}
    })


    let boundFields : number[] | undefined;
    boundFields = proposal.data?.observations?.map(obs => (
        obs.field! as number)
    )

    let fieldNames : string[] = [];
    proposal.data?.fields?.map(field => (fieldNames.push(field.name!)));

    //Remove the "Card" once we have this fully implemented

    // <ObservationFieldModal observationField={undefined}/> can be treated as
    // an alias for the "Add +" button
    return (
        <PanelFrame>
            <PanelHeader
                isLoading={proposal.isLoading}
                itemName={proposal.data?.title!}
                panelHeading={"Observation Fields"}
            />
            <ContextualHelpButton messageId="MaintObsFieldList" />
            <Group justify={"center"}>
                <Card shadow={"sm"} padding={"xs"} radius={"md"} withBorder w={"60%"} m={"lg"}>
                    <Card.Section>
                        <Badge bg={"blue"} c={"yellow"} radius={0}>
                            Prototype Version: Observation Fields not fully implemented
                        </Badge>
                    </Card.Section>
                    <Text c={"pink"} size={"sm"}>
                        Presently you can define a "TargetField" that takes a name input only.
                        Other "Field" types will be added in due time.
                    </Text>
                </Card>
            </Group>

            <ObservationFieldsTable boundFields={boundFields} fieldNames={fieldNames}/>

            <Space h={"xl"}/>
            <Grid>
              <Grid.Col span={10}></Grid.Col>
                              <ObservationFieldModal observationField={undefined}
                                                     fieldNames={fieldNames} />
            </Grid>

        </PanelFrame>
    )
}