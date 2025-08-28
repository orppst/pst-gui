import {ReactElement} from "react";
import {
    Button,
    Divider,
    Fieldset,
    Grid,
    Group,
    Loader,
    ScrollArea,
    Space,
    Stack,
    Text,
    Tooltip
} from "@mantine/core";
import {
    fetchSubmittedProposalResourceSendTACReviewResults,
    useProposalCyclesResourceGetProposalCycle, useSubmittedProposalResourceCheckAllReviewsLocked,
    useSubmittedProposalResourceGetSubmittedProposals,
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationGradesTable from "./allocationGradesTable.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import TACMembersTable from "./TACMembersTable.tsx";
import SubmittedProposalsTable from "./submittedProposalsTable.tsx";
import AvailableResourcesTable from "./availableResourcesTable.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {CLOSE_DELAY, OPEN_DELAY} from "../../constants.tsx";


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

    const {fetcherOptions} = useProposalToolContext();

    const cycleSynopsis = useProposalCyclesResourceGetProposalCycle(
        {pathParams: {cycleCode: Number(selectedCycleCode)}}
    )

    const submittedProposals = useSubmittedProposalResourceGetSubmittedProposals(
        {pathParams:{cycleCode: Number(selectedCycleCode)}}
    )

    const checkReviewsLocked = useSubmittedProposalResourceCheckAllReviewsLocked({
        pathParams: {cycleCode: Number(selectedCycleCode)}
    })


    if (cycleSynopsis.error) {
        notifyError("Failed to load proposal cycle synopsis",
            "cause " + getErrorMessage(cycleSynopsis.error))
    }

    if (submittedProposals.error) {
        notifyError("Failed to load submitted proposals list",
            "cause: " + getErrorMessage(submittedProposals.error))
    }

    if (cycleSynopsis.isLoading || submittedProposals.isLoading || checkReviewsLocked.isLoading) {
        return <Loader />
    }

    const handleSendTacResults = async () => {
        try {
            const promises = submittedProposals.data?.map(
                sp => fetchSubmittedProposalResourceSendTACReviewResults({
                    ...fetcherOptions,
                    pathParams: {cycleCode: Number(selectedCycleCode), submittedProposalId: sp.dbid!}
                })
            )
            await Promise.all(promises!); //might be bad practice using '!' here
        } catch (error) {
            notifyError("Failed to send emails", getErrorMessage(error))
        }
    }


    const DisplayTitle = () : ReactElement => {
        return(
            <h1>{cycleSynopsis.data?.title}</h1>
        )
    }

    const DisplayObservatory = () : ReactElement => {
        return (
            <Fieldset legend={"Observatory"}>
                <Group grow>
                    <Text>{cycleSynopsis.data?.observatory?.name}</Text>
                    <Text c={"orange"}>{cycleSynopsis.data?.observatory?.telescopes?.length} telescopes</Text>
                </Group>
            </Fieldset>
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
                <ScrollArea.Autosize mah={250}>
                    {SubmittedProposalsTable(submittedProposals.data ?? [])}
                </ScrollArea.Autosize>
                <Space h={'xl'}/>
                <Group justify={"center"}>
                    <Tooltip
                        label={checkReviewsLocked.data ?
                            "All proposals' reviews must be completed to email results" :
                            "email TAC results to investigators"}
                        openDelay={OPEN_DELAY}
                        closeDelay={CLOSE_DELAY}
                    >
                        <Button
                            disabled={checkReviewsLocked.data}
                            onClick={handleSendTacResults}
                        >
                            Send TAC results
                        </Button>
                    </Tooltip>
                </Group>
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
            <Grid columns={12}>
                <Grid.Col span={6}>
                    <Stack>
                        <DisplayObservatory />
                        <DisplayDates />
                        <DisplayAllocationGrades />
                        <DisplayTACMembers />
                    </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                    <DisplaySubmittedProposals />
                </Grid.Col>
            </Grid>
            <DisplayAvailableResources />
        </PanelFrame>
    )
}