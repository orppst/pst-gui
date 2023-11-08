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
                        {data?.length === 0? (<Table.Td>Please add an investigator</Table.Td>) : InvestigatorsHeader()}
                        <Table.Tbody>
                        {isLoading ? (`Loading...`)
                            : data?.map((item) => {
                                if(item.dbid !== undefined) {
                                    return (<InvestigatorsRow dbid={item.dbid} key={item.dbid}/>)
                                } else {
                                    return (<Box key={randomId()}>Undefined Investigator!</Box>)
                                }
                            } )
                        }
                        </Table.Tbody>
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

    //Errors come in as name: "unknown", message: "Network Error" with an object called "stack" that
    // contains the exception and message set in the API when the exception is thrown
    const handleError = (error: { stack: { message: any; }; }) => {
        console.error(error);
        alert(error.stack.message);
        setSubmitting(false);
    }

    function handleRemove() {
        setSubmitting(true);
        fetchInvestigatorResourceRemoveInvestigator({pathParams:
                {
                    investigatorId: props.dbid,
                    proposalCode: Number(selectedProposalCode),
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries())
            .catch(handleError);
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

export default InvestigatorsPanel