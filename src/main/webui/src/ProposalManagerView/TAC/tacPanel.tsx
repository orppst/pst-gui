import {ReactElement, useState} from "react";
import {Box, Stack, Table, Text} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
import {randomId} from "@mantine/hooks";
import {useNavigate, useParams} from "react-router-dom";
import {
    fetchTACResourceRemoveCommitteeMember,
    useTACResourceGetCommitteeMember,
    useTACResourceGetCommitteeMembers
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import DeleteButton from "../../commonButtons/delete";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";

/**
 * the data associated with a given member.
 *
 * @param dbid the database id for this person.
 */
type MemberProps = {
    dbid: number
}

/**
 * Lists the time allocation committee members for this cycle with links to add and remove
 * @return ReactElement in a Container
 */
export default function CycleTACPanel() : ReactElement {
    const {selectedCycleCode} = useParams();
    const {data, error, isLoading} =
        useTACResourceGetCommitteeMembers({pathParams: {cycleCode: Number(selectedCycleCode)}});
    const navigate = useNavigate()

    if (error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    function handleAddNew() {
        navigate("new");
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Time Allocation Committee"}/>
            <Stack>
                <AddButton toolTipLabel={"Add new"}
                           onClick={handleAddNew} />
                {data?.length === 0 ?
                    <Box>Please add a committee member</Box>:
                    isLoading ? (<Box>Loading...</Box>) :
                        <Table>
                            <MembersHeader/>
                            <Table.Tbody>
                                {data?.map((item) => {
                                    if(item.dbid !== undefined) {
                                        return (<TACMemberRow dbid={item.dbid}
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
            </Stack>

        </PanelFrame>
    )
}


function MembersHeader(): ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Role</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>eMail</Table.Th>
                <Table.Th>Institute</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    );
}

function TACMemberRow(props: MemberProps): ReactElement {
    const {selectedCycleCode} = useParams();
    const [submitting, setSubmitting] = useState(false);
    const { data, error, isLoading } = useTACResourceGetCommitteeMember(
        {pathParams:
                {
                    memberId: props.dbid,
                    cycleCode: Number(selectedCycleCode),
                },
        });
    const queryClient = useQueryClient();

    const handleError = (error: { stack: { message: any; }; }) => {
        console.error(error);
        alert(error.stack.message);
        setSubmitting(false);
    }

    /**
     * handles the removal of a member
     */
    function handleRemove() {
        setSubmitting(true);
        fetchTACResourceRemoveCommitteeMember({pathParams:
                {
                    memberId: props.dbid,
                    cycleCode: Number(selectedCycleCode),
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries({
                predicate: (query) => {
                    return query.queryKey.length === 6
                        && query.queryKey[4] === 'TAC';
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
            title: "Remove committee member",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove {data?.member?.person?.fullName} from this committee?
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
            <Table.Td>{data?.role}</Table.Td>
            <Table.Td>{data?.member?.person?.fullName}</Table.Td>
            <Table.Td>{data?.member?.person?.eMail}</Table.Td>
            <Table.Td>{data?.member?.person?.homeInstitute?.name}</Table.Td>
            <Table.Td><DeleteButton toolTipLabel={"delete"}
                                    onClick={openRemoveModal} />
            </Table.Td>
        </Table.Tr>
    )
}