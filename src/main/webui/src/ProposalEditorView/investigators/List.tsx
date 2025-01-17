import { ReactElement, useContext, useState } from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {
    fetchInvestigatorResourceRemoveInvestigator,
    fetchInvestigatorResourceChangeInvestigatorKind,
    fetchInvestigatorResourceGetInvestigators,
    useInvestigatorResourceGetInvestigator,
    useInvestigatorResourceGetInvestigators,
} from "src/generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Grid, Stack, Table, Text} from "@mantine/core";

import {randomId} from "@mantine/hooks";
import DeleteButton from "src/commonButtons/delete";
import SwapRoleButton from 'src/commonButtons/swapRole';
import AddButton from "src/commonButtons/add";
import { JSON_SPACES } from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import { InvestigatorKind, Person } from 'src/generated/proposalToolSchemas.ts';
import { ProposalContext } from 'src/App2.tsx';
import { useModals } from "@mantine/modals";


/**
 * the data associated with a given person.
 *
 * @param dbid the database id for this person.
 */
type PersonProps = {
    dbid: number
    email?: string
}

type InvestigatorProps = {
    dbid?: number
    name?: string
}

type TypedInvestigator = {
    person: Person
    type: InvestigatorKind
    _id: number
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
    const { user } = useContext(ProposalContext);
     

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
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Investigators"}/>
                <ContextualHelpButton messageId="MaintInvestList" />
                <Stack>
                    {data?.length === 0 ?
                        <div>Please add an investigator</div>:
                        isLoading ? (<div>Loading...</div>) :
                    <Table>
                        <InvestigatorsHeader/>
                        <Table.Tbody>
                            {data?.map((item) => {
                                if(item.dbid !== undefined) {
                                    return (<InvestigatorsRow dbid={item.dbid}
                                                              email={user.eMail}
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
                <p> </p>
                <Grid >
                   <Grid.Col span={10}></Grid.Col>
                       <AddButton toolTipLabel={"Add new"}
                            onClick={handleAddNew} />
                </Grid>
                <p> </p>
        </PanelFrame>
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
        <>

        <Table.Thead>

            <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>eMail</Table.Th>
                <Table.Th>Institute</Table.Th>
                <Table.Th>Actions</Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>

        </>
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
        notifyError("Error deleting", error.stack.message);
        setSubmitting(false);
    }

        /**
     * count PIs 
     * @return number
     * 
     */
    function CheckPiCount(delegateFucntion: Function) {

        let PiProfile = 0;
        let investigatorIDs = Array<number>();
        setSubmitting(true);
        fetchInvestigatorResourceGetInvestigators({
            pathParams: {
                    proposalCode: Number(selectedProposalCode),
                }
            })
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries({
                predicate: (query) => {
                    
                    if(query.queryKey.length === 5)
                    {   
                        const investigatorList = (query.state.data as Array<InvestigatorProps>);
                        if(typeof(investigatorList) == "object")
                        {
                            if(investigatorIDs.length < investigatorList.length){
                                investigatorList.forEach(inv => { investigatorIDs.push(inv.dbid as number) });
                            }
                        }
                    }

                    if(query.queryKey.length === 6)
                    {                      
                        //find the id of this object - 
                        //see if its in our list
                        //if it is then we read the type
                        //if the type is PI we add it to the picount
                        //then we remove the index from investigatorID so we don't do more than once per item
                        const investigator = (query.state.data as TypedInvestigator)
                        const target = investigatorIDs.indexOf(investigator._id);
                        if(target >= 0)
                        {
                            console.log(investigator.type)
                            if(investigator.type == "PI")
                            {
                                PiProfile += 1;
                                
                            }
                            console.log(PiProfile);
                            investigatorIDs[target] = -1;
                        }
                    }
                    return true;
                }
            }))
            .finally(() => {
                //if there are too few PI's prevent the action
                if(PiProfile < 2)
                {
                    lastPiContext();
                }
                //otherwise go for it
                else{
                    delegateFucntion();
                }
                

            })
            .catch(handleError);
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
     * handles the exchange of an investigator from PI to COI.
     */
    function SwitchInvestigatorKind() {
        var investigatorTypeSetting:InvestigatorKind = "COI";
        if(data?.type == 'COI')
        {
            investigatorTypeSetting = "PI";

        }
        setSubmitting(true);
        console.log(investigatorTypeSetting);
        fetchInvestigatorResourceChangeInvestigatorKind({
            pathParams: {
                    investigatorId: props.dbid,
                    proposalCode: Number(selectedProposalCode),
                },
            body: investigatorTypeSetting
            })
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries({
                predicate: (query) => {
                    // using 'length === 6' to ensure we get the set of investigators
                    return query.queryKey.length === 6 &&
                        query.queryKey[4] === 'investigators';
                }
            }))
            .catch(handleError);
    }

    /**
     * gives the user an option to verify if they wish to remove an
     * investigator.
     */

    function HandleSwap()
    {
        if(data?.type == "COI")
        {
            //if the target is a coi, allow swap to PI
            return SwitchInvestigatorKind();
        }
        else{
            //if the user is a PI, ensure there is another PI on the proposal
            //if there is no other PI, prevent this
            return CheckPiCount(SwitchInvestigatorKind);
        }
    }

    function HandleDelete()
    {
        //COI or PI
        if(data?.type == "COI")
        {
            //warn if the user is trying to remove themselves 
            if(data?.person?.eMail == props.email){
                return openRemoveSelfModal();
            }
            //if the target is a coi, allow removal
            return openRemoveModal(); 
        }
        //if the target is a PI, dont delete, but offer to swap to a COI
        else {
            return openSwitchModal();  
        }
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

    const openRemoveSelfModal = () =>
        modals.openConfirmModal({
            title: "Warning, this user is you!",
            centered: true,
            children: (
                <Text size="sm">
                    Removing yourself from the proposal will prevent you from accessing it in the future.<br/><br/>Be sure this is your inteded action before proceeding.
                </Text>
            ),
            labels: { confirm: "Remove myself from proposal", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove(),
        });

    const openSwitchModal = () =>
        modals.openConfirmModal({
            title: "Confirm this action",
            centered: true,
            children: (
                <Text size="sm">
                    You can't remove a PI from a proposal.<br/>Would you like to change {data?.person?.fullName} to a COI instead?
                </Text>
            ),
            labels: { confirm: "OK", cancel: "Cancel" },
            confirmProps: { color: "green" },
            onConfirm: () =>  CheckPiCount(SwitchInvestigatorKind),
        });

    const modals = useModals();
    const lastPiContext = () =>
        modals.openContextModal("investigator_modal", {
            title: "Alert",
            centered: true,
            innerProps: "Proposals MUST have at least one PI. Another PI must be added before the action is allowed.",
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
        <>
        <Table.Tr>
            <Table.Td>{data?.type}</Table.Td>
            <Table.Td>{data?.person?.fullName}</Table.Td>
            <Table.Td>{data?.person?.eMail}</Table.Td>
            <Table.Td>{data?.person?.homeInstitute?.name}</Table.Td>
            <Table.Td><SwapRoleButton toolTipLabel={"swap role"}
                                    onClick={HandleSwap}
                                     />
            </Table.Td>
            <Table.Td><DeleteButton toolTipLabel={"delete"}
                                    onClick={HandleDelete} />
            </Table.Td>
        </Table.Tr>
        
        </>
    )
}
export default InvestigatorsPanel