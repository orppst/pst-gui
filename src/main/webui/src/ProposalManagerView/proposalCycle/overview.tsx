import {ReactElement} from "react";
import {Divider, Fieldset, Group, Space, Stack, Text} from "@mantine/core";
import {
    useProposalCyclesResourceGetProposalCycle
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationGradesTable from "./allocationGradesTable.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import TACMembersTable from "./TACMembersTable.tsx";
import SubmittedProposalsTable from "./submittedProposalsTable.tsx";
import AvailableResourcesTable from "./availableResourcesTable.tsx";


//ASSUMES input string is ISO date-time at GMT+0
function prettyDateTime(input : string ) : string {
    const dateTime : string[] = input.split('T');
    const date = dateTime[0];
    const timeFrac = dateTime[1];

    const time = timeFrac.split('.')[0];

    return date + " " + time + " GMT";
}

export default function CycleOverviewPanel() : ReactElement {

    const {selectedCycleCode} = useParams();

    const cycleSynopsis = useProposalCyclesResourceGetProposalCycle(
        {pathParams: {cycleCode: Number(selectedCycleCode)}}
    )

    if (cycleSynopsis.error) {
        notifyError("Failed to load proposal cycle synopsis",
            "cause " + getErrorMessage(cycleSynopsis.error))
    }


    const DisplayTitle = () : ReactElement => {
        return(
            <h1>{cycleSynopsis.data?.title}</h1>
        )
    }

    const DisplayDates = () : ReactElement => {
        return (
            <Fieldset legend={"Important Dates"}>
                <Stack>
                    <Group grow>
                        <Text>Submission deadline:</Text>
                        {
                            cycleSynopsis.data?.submissionDeadline &&
                            <Text c={"orange"}> {prettyDateTime(cycleSynopsis.data.submissionDeadline)}</Text>
                        }
                    </Group>
                    <Divider />
                    <Group grow>
                        <Text>Observation session start:</Text>
                        {
                            cycleSynopsis.data?.observationSessionStart &&
                            <Text c={"orange"}>{prettyDateTime(cycleSynopsis.data.observationSessionStart)}</Text>
                        }
                    </Group>
                    <Divider />
                    <Group grow>
                        <Text>Observation session end:</Text>
                        {
                            cycleSynopsis.data?.observationSessionEnd &&
                            <Text c={"orange"}>{prettyDateTime(cycleSynopsis.data.observationSessionEnd)}</Text>
                        }
                    </Group>
                </Stack>
            </Fieldset>

        )
    }

    const DisplayAllocationGrades = () : ReactElement => {
        return (
            <Fieldset legend={"Allocation Grades"}>
                {AllocationGradesTable(Number(selectedCycleCode))}
            </Fieldset>
        )
    }

    const DisplayTACMembers = () : ReactElement => {
        return (
            <Fieldset legend={"TAC Members"}>
                {TACMembersTable(Number(selectedCycleCode))}
            </Fieldset>
        )
    }

    const DisplaySubmittedProposals = () : ReactElement => {
        return (
            <Fieldset legend={"Submitted Proposals"}>
                {SubmittedProposalsTable(Number(selectedCycleCode))}
            </Fieldset>
        )
    }

    const DisplayAvailableResources = () : ReactElement => {
        return (
            <Fieldset legend={"Available Resources"}>
                {AvailableResourcesTable(Number(selectedCycleCode))}
            </Fieldset>
        )
    }


    return (
        <PanelFrame>
            <DisplayTitle />
            <DisplayDates />
            <Space h={"xl"}/>
            <DisplayAllocationGrades />
            <Space h={"xl"}/>
            <DisplayTACMembers />
            <Space h={"xl"}/>
            <DisplaySubmittedProposals />
            <Space h={"xl"}/>
            <DisplayAvailableResources />
        </PanelFrame>
    )
}