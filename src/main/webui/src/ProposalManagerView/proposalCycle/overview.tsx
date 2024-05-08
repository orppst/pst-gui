import {ReactElement} from "react";
import {Box, Divider, Group, Stack, Text} from "@mantine/core";
import {
    useProposalCyclesResourceGetProposalCycle
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {JSON_SPACES} from "../../constants.tsx";
import {PanelFrame} from "../../commonPanel/appearance.tsx";


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

    const cycle = useProposalCyclesResourceGetProposalCycle(
        {pathParams: {cycleCode: Number(selectedCycleCode)}}
    )

    if (cycle.error) {
        return (
            <Box>
                <pre>{JSON.stringify(cycle.error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const DisplayTitle = () : ReactElement => {
        return(
            <h1>{cycle.data?.title}</h1>
        )
    }

    const DisplayDates = () : ReactElement => {
        return (
            <Stack>
                <h3>Important Dates</h3>
                <Group grow>
                <Text>Submission deadline:</Text>
                    {
                        cycle.data?.submissionDeadline &&
                        <Text c={"orange"}> {prettyDateTime(cycle.data.submissionDeadline)}</Text>
                    }
                </Group>
                <Divider />
                <Group grow>
                    <Text>Observation session start:</Text>
                    {
                        cycle.data?.observationSessionStart &&
                        <Text c={"orange"}>{prettyDateTime(cycle.data.observationSessionStart)}</Text>
                    }
                </Group>
                <Divider />
                <Group grow>
                    <Text>Observation session end:</Text>
                    {
                        cycle.data?.observationSessionEnd &&
                        <Text c={"orange"}>{prettyDateTime(cycle.data.observationSessionEnd)}</Text>
                    }
                </Group>
            </Stack>

        )
    }


    return (
        <PanelFrame>
            <DisplayTitle />
            <DisplayDates />
            {
                //ToDo: display functions for other fields of a proposal cycle e.g., tac members, resources,...
            }
        </PanelFrame>
    )
}