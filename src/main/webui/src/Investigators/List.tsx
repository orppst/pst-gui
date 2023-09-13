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
                {isLoading ? (`Loading...`)
                    : data?.map((item) => {
                        if(item.dbid !== undefined) {
                            return (<RenderPerson dbid={item.dbid} key={item.dbid}/>)
                        } else {
                            return (<Box>Undefined Investigator!</Box>)
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
        <Box sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            margin: theme.spacing.md,
            borderRadius: theme.radius.md,
            cursor: 'pointer',
            '&:hover': {
                backgroundColor:
                    theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            },
        })}>
            {isLoading?(`Loading...`):
                error?(`Error!`):
                    submitting?(`Removing...`):
                        (
                            <Table>
                                <tbody>
                                <tr><td>Type</td><td>{data?.type}</td></tr>
                                <tr><td>Name</td><td>{data?.person?.fullName}</td></tr>
                                <tr><td>Email</td><td>{data?.person?.eMail}</td></tr>
                                <tr><td>Institute</td><td>{data?.person?.homeInstitute?.name}</td></tr>
                                <tr><td colSpan={2} align={"right"}><Button color="red" onClick={openRemoveModal}>Remove</Button></td></tr>
                                </tbody>
                            </Table>
                        )
            }
        </Box>
    );
}


export default InvestigatorsPanel