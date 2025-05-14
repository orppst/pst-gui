import {ReactElement, useContext} from "react";
import {
    useProposalCyclesResourceGetProposalCycleDates,
    useProposalCyclesResourceGetProposalCycleObservatory,
    useProposalCyclesResourceGetProposalCycleTitle
} from "../../generated/proposalToolComponents.ts";
import {Box, Divider, Fieldset, Loader, ScrollArea, Stack, Table, Text} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import {PanelFrame} from "../../commonPanel/appearance.tsx";
import {ProposalContext} from "../../App2";
import {POLARIS_MODES} from "../../constants";
import {useOpticalOverviewTelescopeTableData} from "../../util/telescopeComms";
import {useParams} from "react-router-dom";

export default
function DisplaySubmissionDetails(props: {
    formData: SubmissionFormValues,
    smallScreen?: boolean,
}) : ReactElement {

    // get mode.
    const polarisMode = useContext(ProposalContext).mode;

    // get proposal id.
    let {selectedProposalCode } = useParams();
    selectedProposalCode = selectedProposalCode!;

    //show cycle title, submission deadline, observations and their modes,
    //essentially a summary of the steps to this point
    const cycleTitle = useProposalCyclesResourceGetProposalCycleTitle({
        pathParams: {
            cycleCode: props.formData.selectedCycle
        }
    })

    const cycleDates = useProposalCyclesResourceGetProposalCycleDates(
        {pathParams: {cycleCode: props.formData.selectedCycle} });

    const observatory = useProposalCyclesResourceGetProposalCycleObservatory({
        pathParams: {cycleCode: props.formData.selectedCycle}
    })

    const {
        data: opticalData,
        error: opticalError,
        isLoading: opticalLoading,
    } = useOpticalOverviewTelescopeTableData({
        proposalID: selectedProposalCode
    });



    const radioTableHeader = () => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Observation</Table.Th>
                <Table.Th>Observing Mode</Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const radioTableBody = () => {
        return(
            <Table.Tbody>
                {props.formData.selectedModes.map(
                    (modeTuple: ObservationModeTuple) => {
                        return (radioTableRow({modeTuple}))
                    })}
            </Table.Tbody>
        )
    }

    const radioTableRow = (p: {modeTuple: ObservationModeTuple}) => {
        return (
            <Table.Tr key={p.modeTuple.observationId + p.modeTuple.observationName}>
                <Table.Td>
                    {p.modeTuple.observationType + " | "  + p.modeTuple.observationName}
                </Table.Td>
                <Table.Td>
                    {p.modeTuple.modeName}
                </Table.Td>
            </Table.Tr>
        )
    }

    /**
     * the table header when in optical mode.
     */
    const opticalTableHeader = () => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Observation</Table.Th>
                <Table.Th>Telescope</Table.Th>
                <Table.Th>Time</Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    /**
     * the body of the optical table.
     */
    const opticalTableBody = () => {
        return(
            <Table.Tbody>
                {props.formData.selectedModes.map(
                    (modeTuple: ObservationModeTuple) => {
                        return (opticalTableRow({modeTuple}))
                    })}
            </Table.Tbody>
        )
    }

    const opticalTableRow = (p: {modeTuple: ObservationModeTuple}) => {
        const timeValue = opticalData?.get(p.modeTuple.observationId.toString())?.telescopeTimeValue;
        const timeUnit = opticalData?.get(p.modeTuple.observationId.toString())?.telescopeTimeUnit;

        return (
            <Table.Tr key={p.modeTuple.observationId + p.modeTuple.observationName}>
                <Table.Td>
                    {p.modeTuple.observationType + " | "  + p.modeTuple.observationName}
                </Table.Td>
                <Table.Td>
                    {opticalData?.get(
                        p.modeTuple.observationId.toString())?.telescopeName}
                </Table.Td>
                <Table.Td>
                    {`${timeValue} ${timeUnit}`}
                </Table.Td>
            </Table.Tr>
        )
    }


    // lock out page till data all loaded.
    if (cycleTitle.isLoading || cycleDates.isLoading ||
            observatory.isLoading || opticalLoading) {
        return(
            <Box mx={"50%"}>
                <Loader/>
            </Box>
        )
    }

    if (cycleTitle.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle title"}
                error={getErrorMessage(cycleTitle.error)}
            />
        );
    }

    if (cycleDates.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle dates"}
                error={getErrorMessage(cycleDates.error)}
            />
        );
    }

    if (observatory.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load observatory data"}
                error={getErrorMessage(observatory.error)}
            />
        );
    }

    if (opticalError) {
        return (
            <AlertErrorMessage
                title={"Failed to load telescope data"}
                error={getErrorMessage(opticalError)}
            />
        );
    }

    return (
        <PanelFrame
            maw={props.smallScreen ? "100%": "75%"}
            ml={props.smallScreen ? "" : "10%"}>
            <Stack>
                <Text>
                    {observatory.data?.name}: {cycleTitle.data} - Review Details
                </Text>
                <Divider/>
                <Text size={"sm"} c={"grey"}>
                    If you are happy with the following details please submit your proposal else go back and make the desired changes.
                </Text>
                <Fieldset legend={"Submission Details"}>
                    <Stack>
                        <Text>
                            Submitting to: <Text span c={"blue"}>
                                {cycleTitle.data}
                            </Text>
                        </Text>
                        <Text>
                            Submission deadline: <Text span c={"teal"}>
                                {cycleDates.data?.submissionDeadline?.slice(0, 10)}
                            </Text>
                        </Text>
                        <ScrollArea h={250}>
                            <Table.ScrollContainer minWidth={500}/>

                            { polarisMode !== POLARIS_MODES.OPTICAL ?
                                <Table stickyHeader>
                                    {radioTableHeader()}
                                    {radioTableBody()}
                                </Table>
                            :
                                <Table stickyHeader>
                                    {opticalTableHeader()}
                                    {opticalTableBody()}
                                </Table>
                            }
                        </ScrollArea>
                    </Stack>
                </Fieldset>
            </Stack>
        </PanelFrame>
    )
}