import {ReactElement} from "react";
import {Box, Loader, Stack, Table, Text} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {
    useTACResourceGetCommitteeMember,
    useTACResourceGetCommitteeMembers,
    useTACResourceRemoveCommitteeMember
} from "../../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {modals} from "@mantine/modals";
import DeleteButton from "../../commonButtons/delete";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";

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

    const tacMembers =
        useTACResourceGetCommitteeMembers({
            pathParams: {
                cycleCode: Number(selectedCycleCode)
            }
        });

    const navigate = useNavigate()

    if (tacMembers.isLoading) {
        return (
            <Loader/>
        )
    }

    if (tacMembers.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to fetch tacMembers"}
                error={tacMembers.error} />
        )
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Time Allocation Committee"}
            />
            <Stack>
                <AddButton
                    toolTipLabel={"Add new"}
                    onClick={()=> navigate("new")}
                />
                {tacMembers.data?.length === 0 ?
                    <Box>Please add a committee member</Box>:
                    tacMembers.isLoading ? (<Box>Loading...</Box>) :
                        <Table>
                            <MembersHeader/>
                            <Table.Tbody>
                                {tacMembers.data?.map((item) =>
                                    (<TACMemberRow dbid={item.dbid!} key={item.dbid}/>)
                                )}
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

    const tacMember =
        useTACResourceGetCommitteeMember({
            pathParams: {
                memberId: props.dbid,
                cycleCode: Number(selectedCycleCode),
            },
        });

    const removeCommitteeMember =
        useTACResourceRemoveCommitteeMember()

    const queryClient = useQueryClient();

    /**
     * handles the removal of a member
     */
    function handleRemove() {
        removeCommitteeMember.mutate({
            pathParams: {
                memberId: props.dbid,
                cycleCode: Number(selectedCycleCode),
            }
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                .then(() => notifySuccess("Success", "TAC member removed" ))
            },
            onError: (error) =>
                notifyError("Failed to remove member", getErrorMessage(error)),
        })
    }

    /**
     * gives the user an option to verify if they wish to remove a member (ha!).
     */
    const confirmMemberRemoval = () =>
        modals.openConfirmModal({
            title: "Remove committee member",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove {tacMember.data?.member?.person?.fullName} from this committee?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove(),
        });

    // track error states
    if (tacMember.isLoading) {
        return ( <Loader /> )
    }

    if (tacMember.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to get TAC member"}
                error={getErrorMessage(tacMember.error)}
            />
        );
    }

    // return the full row.
    return (
        <Table.Tr>
            <Table.Td>{tacMember.data?.role}</Table.Td>
            <Table.Td>{tacMember.data?.member?.person?.fullName}</Table.Td>
            <Table.Td>{tacMember.data?.member?.person?.eMail}</Table.Td>
            <Table.Td>{tacMember.data?.member?.person?.homeInstitute?.name}</Table.Td>
            <Table.Td>
                <DeleteButton
                    toolTipLabel={"delete"}
                    onClick={confirmMemberRemoval}
                />
            </Table.Td>
        </Table.Tr>
    )
}