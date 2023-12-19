import {ReactElement, useEffect, useState} from "react";
import {Box, Select, Table, Text} from "@mantine/core";
import {
    fetchProposalCyclesResourceGetProposalCycleDates,
    fetchProposalCyclesResourceSubmitProposal,
    ProposalCyclesResourceSubmitProposalVariables,
    useProposalCyclesResourceGetProposalCycles
} from "../generated/proposalToolComponents.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useForm} from "@mantine/form";
import {JSON_SPACES} from "../constants.tsx";
import {SubmitButton} from "../commonButtons/save.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";

function SubmitPanel(): ReactElement {
    const {selectedProposalCode} = useParams();
    const navigate = useNavigate();
    const [searchData, setSearchData] = useState([]);
    const [submissionDeadline, setSubmissionDeadline] = useState("undefined");
    const {data, error,  status} =
        useProposalCyclesResourceGetProposalCycles({queryParams: {includeClosed: false}});
    const queryClient = useQueryClient();
    const form = useForm({
        initialValues: {
            selectedCycle: 0,
        },
    });

    useEffect(() => {
        if (status === 'success') {
            setSearchData([]);
            data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {
                    value: String(item.dbid), label: item.name}])
            ));
        }
    }, [status,data]);

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    const changeCycleDates = (value: string | null) => {
        console.log("Selected cycle is now " + value);
        fetchProposalCyclesResourceGetProposalCycleDates(
            {pathParams: {cycleCode: Number(value)}})
            .then((dates) => {
                setSubmissionDeadline(dates.submissionDeadline!);
                console.log(dates)
            })
            .catch(console.log)

        form.values.selectedCycle = Number(value)   ;
    }

    const trySubmitProposal = form.onSubmit(() => {
        const submissionVariables: ProposalCyclesResourceSubmitProposalVariables = {
            pathParams: {cycleCode: Number(form.values.selectedCycle)},
            body: Number(selectedProposalCode),
            // @ts-ignore
            headers: {"Content-Type": "text/plain"}
        };

        fetchProposalCyclesResourceSubmitProposal(submissionVariables)
            .then(()=> {
                notifications.show({
                    autoClose: 5000,
                    title: "Submission",
                    message: 'Your proposal has been submitted',
                    color: 'green',
                    className: 'my-notification-class',
                });
                queryClient.invalidateQueries().then();
                navigate("/proposal/" + selectedProposalCode);
            })
            .catch((error) => {
                notifications.show({
                    autoClose: 5000,
                    title: "Submission failed",
                    message: error.stack.message,
                    color: 'red',
                    className: 'my-notification-class',
                });
            })
    });

    return (
        <Box>
            <Text fz="lg" fw={700}>Submit Proposal</Text>

            <Box m={20}>This is where we can have a validation overview, the following are <b>not</b> real!
                <Table>
                    <Table.Tbody>
                        <Table.Tr><Table.Td>✅</Table.Td><Table.Td>Summary</Table.Td></Table.Tr>
                        <Table.Tr><Table.Td>✅</Table.Td><Table.Td>Investigators</Table.Td></Table.Tr>
                        <Table.Tr><Table.Td>✅</Table.Td><Table.Td>Targets</Table.Td></Table.Tr>
                        <Table.Tr><Table.Td>✅</Table.Td><Table.Td>Technical Goals</Table.Td></Table.Tr>
                        <Table.Tr><Table.Td>✅</Table.Td><Table.Td>Observations</Table.Td></Table.Tr>
                        <Table.Tr><Table.Td>✅</Table.Td><Table.Td>Documents</Table.Td></Table.Tr>
                    </Table.Tbody>
                </Table>
            </Box>

            <form onSubmit={trySubmitProposal}>
                <Select label={"Cycle"}
                    data={searchData}
                    {...form.getInputProps("selectedCycle")}
                    onChange={changeCycleDates}
                />
                <Text>Submission deadline {submissionDeadline}</Text>
                <SubmitButton
                    disabled={form.values.selectedCycle===0}
                    label={"Submit proposal"}
                    toolTipLabel={"Submit your proposal to the selected cycle"}
                />
            </form>
        </Box>
    )
}

export default SubmitPanel