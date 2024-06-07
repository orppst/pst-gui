import {ReactElement} from "react";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import AssignReviewersAccordion from "./assignReviewers.accordion.tsx";
import {Badge, Card, Group, Text} from "@mantine/core";



export default function AssignReviewersPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Assign Reviewers"}
            />

            <Group justify={"center"}>
                <Card shadow={"sm"} padding={"xs"} radius={"md"} withBorder w={"60%"} m={"lg"}>
                    <Card.Section>
                        <Badge bg={"blue"} c={"yellow"} radius={0}>
                            Prototype Version: This should be a "TAC Chair" viewable page only
                        </Badge>
                    </Card.Section>
                    <Text c={"pink"} size={"sm"}>
                        In the release version it is envisaged that this page be available to a user
                        or users with the "TAC Chair" role only. Other Committee members can self-assign as
                        a Reviewer to Submitted Proposals of choice elsewhere.
                    </Text>
                </Card>
            </Group>

            <AssignReviewersAccordion />

        </PanelFrame>
    )
}