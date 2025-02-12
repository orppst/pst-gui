import {ReactElement} from "react";
import {
    useProposalCyclesResourceGetProposalCycleDates,
    useProposalCyclesResourceGetProposalCycleTitle
} from "../../generated/proposalToolComponents.ts";
import {Box, Fieldset, Loader, ScrollArea, Space, Stack, Table, Text} from "@mantine/core";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";

export default
function DisplaySubmissionDetails(props: {formData: SubmissionFormValues}) : ReactElement {

    //show cycle title, submission deadline, observations and their modes,
    //essentially a summary of the steps to this point

    const cycleTitle = useProposalCyclesResourceGetProposalCycleTitle({
        pathParams: {
            cycleCode: props.formData.selectedCycle
        }
    })

    const cycleDates = useProposalCyclesResourceGetProposalCycleDates(
        {pathParams: {cycleCode: props.formData.selectedCycle} });


    const tableHeader = () => (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Observation</Table.Th>
                <Table.Th>Observing Mode</Table.Th>
            </Table.Tr>
        </Table.Thead>
    )

    const tableBody = () => {
        return(
            <Table.Tbody>
                {props.formData.selectedModes.map(
                    (modeTuple: ObservationModeTuple) => {
                        return (tableRow({modeTuple}))
                    })}
            </Table.Tbody>
        )
    }

    const tableRow =
        (p: {modeTuple: ObservationModeTuple}) => {
            return (
                <Table.Tr key={p.modeTuple.observationId}>
                    <Table.Td>
                        {p.modeTuple.observationType + " | "  + p.modeTuple.observationName}
                    </Table.Td>
                    <Table.Td>
                        {p.modeTuple.modeName}
                    </Table.Td>
                </Table.Tr>
            )
        }


    if (cycleTitle.isLoading || cycleDates.isLoading) {
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

    return (
        <>
            <Text size={"sm"} c={"grey"}>
                If you are happy with the following details please submit your proposal else go back and make the desired changes.
            </Text>
            <Space h={"md"}/>
            <Fieldset legend={"Submission Details"} mx={"10%"}>
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
                        <Table stickyHeader>
                            {tableHeader()}
                            {tableBody()}
                        </Table>
                    </ScrollArea>
                </Stack>
            </Fieldset>
        </>
    )
}