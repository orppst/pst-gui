import {ReactElement, useEffect, useState} from "react";
import {Box, Select, Table, Text} from "@mantine/core";
import {
    fetchProposalCyclesResourceSubmitProposal,
    ProposalCyclesResourceSubmitProposalVariables,
    useProposalCyclesResourceGetProposalCycles
} from "../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useForm} from "@mantine/form";
import {JSON_SPACES} from "../constants.tsx";
import {SubmitButton} from "../commonButtons/save.tsx";
import {useQueryClient} from "@tanstack/react-query";

function SubmitPanel(): ReactElement {
    const {selectedProposalCode} = useParams();
    const [searchData, setSearchData] = useState([]);
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

    const trySubmitProposal = form.onSubmit((val) => {
        console.log("Going to submit to cycle " + val.selectedCycle);

        const submissionVariables: ProposalCyclesResourceSubmitProposalVariables = {
            pathParams: {cycleCode: Number(form.values.selectedCycle)},
            body: Number(selectedProposalCode),
            // @ts-ignore
            headers: {"Content-Type": "text/plain"}
        };

        fetchProposalCyclesResourceSubmitProposal(submissionVariables)
            .then(() => {console.log("Submitted the proposal")})
            .then(()=> {
                return queryClient.invalidateQueries();
            })
            .catch(console.log);
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
                />
                <SubmitButton
                    disabled={form.values.selectedCycle===0}
                    label={"Submit proposal"}
                    toolTipLabel={"Hello world"}
                />
            </form>
        </Box>
    )
}

export default SubmitPanel