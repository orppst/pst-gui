import { ReactElement, useState } from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {
    fetchInvestigatorResourceRemoveInvestigator,
    useInvestigatorResourceGetInvestigator,
    useInvestigatorResourceGetInvestigators,
} from '../generated/proposalToolComponents';
import {useQueryClient} from "@tanstack/react-query";
import {Box, Grid, Table, Text} from "@mantine/core";
import {modals} from "@mantine/modals";
import {randomId} from "@mantine/hooks";
import DeleteButton from "../commonButtons/delete";
import AddButton from "../commonButtons/add";
import { JSON_SPACES } from '../constants.tsx';

/**
 * the data associated with a given person.
 *
 * @param dbid the database id for this person.
 */
type PersonProps = {
    dbid: number
}

/**
 * generates the entire panel for the investigators.
 *
 * @return {ReactElement}: the dynamic html for the investigator panel
 * @constructor
 */
function InvestigatorsPanel(): ReactElement {
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

    /**
     * routes the user to the new investigator page.
     */
    function handleAddNew() {
        navigate("new");
    }

    return (
        <Box>
            <Text fz="lg" fw={700}>Investigators linked to this proposal</Text>
            <Grid>
                <Grid.Col span={5}>
                <AddButton toolTipLabel={"Add new"}
                           onClick={handleAddNew} />
                    {data?.length === 0 ?
                        <div>Please add an investigator</div>:
                        isLoading ? (<div>Loading...</div>) :
                    <Table>
                        <InvestigatorsHeader/>
                        <Table.Tbody>
                            {data?.map((item) => {
                                if(item.dbid !== undefined) {
                                    return (<InvestigatorsRow dbid={item.dbid}
                                                              key={item.dbid}/>)
                                } else {
                                    return (
                                        <Box key={randomId()}>
                                            Undefined Investigator!
                                        </Box>)
                                }
                            })
                            }
                        </Table.Tbody>
                    </Table>}
                </Grid.Col>
            </Grid>
        </Box>
    );
}

/**
 * generates the table header for the investigators.
 *
 * @return {ReactElement} return the dynamic html for the investigator table
 * header.
 * @constructor
 */
function InvestigatorsHeader(): ReactElement {
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

/**
 * generates a row for a given investigator person.
 * @param {PersonProps} props the data associated with a given investigator
 * person.
 * @return {ReactElement} the dynamic html for a investigator table row.
 * @constructor
 */
function InvestigatorsRow(props: PersonProps): ReactElement {
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

    //Errors come in as name: "unknown", message: "Network Error" with an object
    // called "stack" that contains the exception and message set in the API
    // when the exception is thrown
    const handleError = (error: { stack: { message: any; }; }) => {
        console.error(error);
        alert(error.stack.message);
        setSubmitting(false);
    }

    /**
     * handles the removal of an investigator.
     */
    function handleRemove() {
        setSubmitting(true);
        fetchInvestigatorResourceRemoveInvestigator({pathParams:
                {
                    investigatorId: props.dbid,
                    proposalCode: Number(selectedProposalCode),
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries({
                predicate: (query) => {
                    // only invalidate the query for the entire list.
                    // not the separate bits.
                    return query.queryKey.length === 5 &&
                        query.queryKey[4] === 'investigators';
                }
            }))
            .catch(handleError);
    }

    /**
     * gives the user an option to verify if they wish to remove an
     * investigator.
     */
    const openRemoveModal = () =>
        modals.openConfirmModal({
            title: "Remove investigator",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove {data?.person?.fullName}
                    from this proposal?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove(),
        });

    // track error states
    if (isLoading) {
        return (
            <Table.Tr><Table.Td colSpan={5}>
                Loading...
            </Table.Td></Table.Tr>)
    } else if (error !== null) {
        return (
            <Table.Tr><Table.Td colSpan={5}>
                Error!
            </Table.Td></Table.Tr>
        )
    } else if (submitting) {
        return (
            <Table.Tr><Table.Td colSpan={5}>
                Removing...
            </Table.Td></Table.Tr>
        )
    }

    // return the full row.
    return (
        <Table.Tr>
            <Table.Td>{data?.type}</Table.Td>
            <Table.Td>{data?.person?.fullName}</Table.Td>
            <Table.Td>{data?.person?.eMail}</Table.Td>
            <Table.Td>{data?.person?.homeInstitute?.name}</Table.Td>
            <Table.Td><DeleteButton toolTipLabel={"delete"}
                                    onClick={openRemoveModal} />
            </Table.Td>
        </Table.Tr>
    )
}

export default InvestigatorsPanel