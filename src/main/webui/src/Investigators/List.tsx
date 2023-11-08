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

type PersonProps = {
    dbid: number
}

function InvestigatorsPanel() {
    const { selectedProposalCode } = useParams();
    const { data , error, isLoading } = useInvestigatorResourceGetInvestigators({pathParams: {proposalCode: Number(selectedProposalCode)},}, {enabled: true});
    const navigate = useNavigate();


    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
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
                    <Table>
                        {InvestigatorsHeader()}
                        {isLoading ? (`Loading...`)
                            : data?.map((item) => {
                                if(item.dbid !== undefined) {
                                    return (<InvestigatorsRow dbid={item.dbid} key={item.dbid}/>)
                                } else {
                                    return (<Box key={randomId()}>Undefined Investigator!</Box>)
                                }
                            } )
                        }
                    </Table>
                </Grid.Col>
            </Grid>
        </Box>
    );
}

function InvestigatorsHeader() {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>eMail</Table.Th>
                <Table.Th>Institute</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    );
}

function InvestigatorsRow(props: PersonProps) {
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
      <Table.Tr>
          {isLoading?(<Table.Td colSpan={5}>Loading...</Table.Td>):
              error?(<Table.Td colSpan={5}>Error!</Table.Td>):
                  submitting?(<Table.Td colSpan={5}>Removing...</Table.Td>):(<>
          <Table.Td>{data?.type}</Table.Td>
          <Table.Td>{data?.person?.fullName}</Table.Td>
          <Table.Td>{data?.person?.eMail}</Table.Td>
          <Table.Td>{data?.person?.homeInstitute?.name}</Table.Td>
          <Table.Td><Button color="red" onClick={openRemoveModal}>Remove</Button></Table.Td></>)}
      </Table.Tr>
    );
}

/*

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
*/

export default InvestigatorsPanel