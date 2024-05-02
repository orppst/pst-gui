import {ReactElement} from "react";
import { Container, Divider, Fieldset, Group, Space, Stack, Text} from "@mantine/core";
import {
    useProposalCyclesResourceGetProposalCycle
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import AllocationGradesTable from "./possibleGrades.tsx";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


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
        notifications.show({
            message: "cause " + getErrorMessage(cycleSynopsis.error),
            title: "Failed to load proposal cycle synopsis",
            autoClose: 5000,
            color: 'red'
        })
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
                <AllocationGradesTable />
            </Fieldset>
        )
    }

    const DisplayTACMembers = () : ReactElement => {
        return (
            <Fieldset legend={"TAC Members"}>
            </Fieldset>
        )
    }

    const DisplaySubmittedProposals = () : ReactElement => {
        return (
            <Fieldset legend={"Submitted Proposals"}>
            </Fieldset>
        )
    }

    const DisplayAvailableResources = () : ReactElement => {
        return (
            <Fieldset legend={"Available Resources"}>
            </Fieldset>
        )
    }


    return (
        <Container>
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
        </Container>
    )
}