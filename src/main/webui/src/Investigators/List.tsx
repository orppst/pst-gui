import {useState, SyntheticEvent} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    fetchInvestigatorResourceRemoveInvestigator,
    useInvestigatorResourceGetInvestigator,
    useInvestigatorResourceGetInvestigators,
} from "../generated/proposalToolComponents";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Button, Grid, Table, Text} from "@mantine/core";
import {modals} from "@mantine/modals";
import {randomId} from "@mantine/hooks";
import { JSON_SPACES } from '../constants.tsx';

type PersonProps = {
    dbid: number
}

function InvestigatorsPanel() {
    const { selectedProposalCode } = useParams();
    const { data , error, isLoading } =
        useInvestigatorResourceGetInvestigators(
            {pathParams: { proposalCode: Number(selectedProposalCode)},},
            {enabled: true});
    const navigate = useNavigate();


    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    function handleAddNew(event: SyntheticEvent) {
        event.preventDefault();
        navigate(  "new");
    }

    return (
        <Box>
            <Text fz="lg" fw={700}>Investigators linked to this proposal</Text>
            <Grid>
                <Grid.Col span={5}>
                <Button onClick={handleAddNew} >Add New</Button>
                {isLoading ? (`Loading...`)
                    : data?.map((item) => {
                        if(item.dbid !== undefined) {
                            return (<RenderPerson
                                dbid={item.dbid}
                                key={item.dbid}/>)
                        } else {
                            return (
                                <Box key={randomId()}>
                                    Undefined Investigator!
                                </Box>)
                        }
                    } )
                }
                </Grid.Col>
            </Grid>
        </Box>
    );
}

function RenderPerson(props: PersonProps) {
    const { selectedProposalCode } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const { data, error, isLoading } = useInvestigatorResourceGetInvestigator(
        {pathParams:
                    {
                        investigatorId: props.dbid,
                        proposalCode: Number(selectedProposalCode),
                    },
            });
    const queryClient = useQueryClient();

    function handleRemove() {
        setSubmitting(true);
        fetchInvestigatorResourceRemoveInvestigator({pathParams:
                {
                    investigatorId: props.dbid,
                    proposalCode: Number(selectedProposalCode),
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries())
            .catch(console.log);
    }

    const openRemoveModal = () =>
        modals.openConfirmModal({
            title: "Remove investigator",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove {data?.person?.fullName} from this proposal?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove(),
        });

    return (
        <Box>
            {isLoading?(`Loading...`):
                error?(`Error!`):
                    submitting?(`Removing...`):
                        (
                            <Table>
                                <Table.Tbody>
                                    <Table.Tr><Table.Td>Type</Table.Td><Table.Td>{data?.type}</Table.Td></Table.Tr>
                                    <Table.Tr><Table.Td>Name</Table.Td><Table.Td>{data?.person?.fullName}</Table.Td></Table.Tr>
                                    <Table.Tr><Table.Td>Email</Table.Td><Table.Td>{data?.person?.eMail}</Table.Td></Table.Tr>
                                    <Table.Tr><Table.Td>Institute</Table.Td><Table.Td>{data?.person?.homeInstitute?.name}</Table.Td></Table.Tr>
                                    <Table.Tr><Table.Td colSpan={2} align={"right"}><Button color="red" onClick={openRemoveModal}>Remove</Button></Table.Td></Table.Tr>
                                </Table.Tbody>
                            </Table>
                        )
            }
        </Box>
    );
}


export default InvestigatorsPanel