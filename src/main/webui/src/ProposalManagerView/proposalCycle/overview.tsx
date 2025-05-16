import {ReactElement, useContext, useReducer, useRef} from "react";
import {Divider, Fieldset, Group, Space, Stack, Text} from "@mantine/core";
import {
    fetchSubmittedProposalResourceGetSubmittedProposals,
    SubmittedProposalResourceGetSubmittedProposalsResponse,
    useProposalCyclesResourceGetProposalCycle
} from "../../generated/proposalToolComponents.ts";
import {useNavigate, useParams} from "react-router-dom";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationGradesTable from "./allocationGradesTable.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import TACMembersTable from "./TACMembersTable.tsx";
import SubmittedProposalsTable from "./submittedProposalsTable.tsx";
import AvailableResourcesTable from "./availableResourcesTable.tsx";
import {ProposalContext, useToken} from "../../App2";
import {ExportButton} from "../../commonButtons/export";
import {POLARIS_MODES} from "../../constants";
import {downloadProposals} from "./downloadProposals";
import {useProposalToolContext} from "../../generated/proposalToolContext";
import {useQueryClient} from "@tanstack/react-query";


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

    const authToken = useToken();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const printRef = useRef<HTMLInputElement>(null);

    const polarisMode = useContext(ProposalContext).mode;

    //this work around is used when deleting a proposal
    const [,forceUpdate] = useReducer(x => x + 1, 0);

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

    const DownloadAllProposals = (): ReactElement => {
        return ExportButton(
            {
                toolTipLabel: `Export all proposals to a file for download`,
                disabled: false,
                onClick: handleDownloadPdf,
                label: "Export cycle Proposals",
                variant: "filled",
                toolTipLabelPosition: "top"
            });
    }

    /**
     * generates the overview pdf and saves it to the users' disk.
     *
     * code extracted from: https://www.robinwieruch.de/react-component-to-pdf/
     * @return {Promise<void>} promise that the pdf will be saved at some point.
     */
    async function handleDownloadPdf(): Promise<void> {
        await fetchSubmittedProposalResourceGetSubmittedProposals(
            {...fetcherOptions,
             pathParams: {cycleCode: Number(selectedCycleCode)}}
        ).then(
            (data: SubmittedProposalResourceGetSubmittedProposalsResponse) => {
                if (cycleSynopsis.data?.title != null) {
                    downloadProposals(
                        data, forceUpdate, authToken, cycleSynopsis.data?.title,
                        printRef, navigate, queryClient, polarisMode);
                }
            }
        )
    }

    /**
     * generates the html.
     */
    return (
        <PanelFrame>
            <DisplayTitle />
            { polarisMode === POLARIS_MODES.OPTICAL &&
                <>
                    <Space h={"xl"}/>
                    <DownloadAllProposals/>
                    <Space h={"xl"}/>
                </>
            }
            <DisplayObservatory />
            <Space h={"xl"}/>
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