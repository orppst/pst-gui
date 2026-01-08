import {ReactElement, useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {
    useInvestigatorResourceRemoveInvestigator,
    useInvestigatorResourceChangeInvestigatorKind,
    useInvestigatorResourceGetInvestigatorsAsObjects,
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
import {Investigator, InvestigatorKind, Organization, Person} from 'src/generated/proposalToolSchemas.ts';
import { ProposalContext } from 'src/App2.tsx';
import { useModals } from "@mantine/modals";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";


/**
 * the data associated with a given person.
 *
 * @param dbid the database id for this person.
 */
type PersonProps = {
    investigator: Investigator
    amIaPI: Boolean
}

// count of the PIs.
let PiCount = 0;

/**
 * generates the entire panel for the investigators.
 *
 * @return {ReactElement}: the dynamic html for the investigator panel
 * @constructor
 */
function InvestigatorsPanel(): ReactElement {
    const { selectedProposalCode } = useParams();
    //Cache the people and institutes
    let allPeople: Person[] = [];
    let allOrganizations: Organization[] = [];
    const { user } = useContext(ProposalContext);
    const [userIsPI, setUserIsPi] = useState(false);

    const { data , status, error, isLoading } =
        useInvestigatorResourceGetInvestigatorsAsObjects(
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
     * maintain a count of the PIs
     */
    useEffect(() => {
        if(status ==='success') {
            PiCount = 0;
            if(data !== undefined) {
                data.map((investigator) => {
                    if(investigator.type == 'PI') {
                        PiCount++;
                        //console.log("Checking " + investigator.person?._id + " type " + investigator.type + " against "+ user._id);
                        if(investigator.person?._id == user._id)
                            setUserIsPi(true);
                    }
                })
                //console.log("PiCount = "+ PiCount);
            }

        } else if(error) {
            notifyError("Error loading investigators", getErrorMessage(error));
        }

    }, [data]);


    /**
     * routes the user to the new investigator page.
     */
    function handleAddNew() {
        navigate("new");
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
                        {userIsPI && <Table.Th>Actions</Table.Th>}
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>

            </>
        );
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
                                if(item.person !== undefined) {
                                    let thisInvestigator = item;
                                    if(item.person._id !== undefined)
                                        allPeople.push(item.person);
                                    else
                                        thisInvestigator.person = allPeople.find(p => item.person === p._id);

                                    if(thisInvestigator.person?.homeInstitute?._id !== undefined)
                                        allOrganizations.push(thisInvestigator.person.homeInstitute)
                                    else
                                        thisInvestigator.person!.homeInstitute =
                                            allOrganizations.find(i => thisInvestigator.person?.homeInstitute === i._id)

                                    return (<InvestigatorsRow investigator={thisInvestigator!}
                                                              amIaPI={userIsPI}
                                                              key={item._id}/>)
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
                    {userIsPI && <AddButton toolTipLabel={"Add new"}
                            onClick={handleAddNew} />}
                </Grid>
                <p> </p>
        </PanelFrame>
    );
}


/**
 * generates a row for a given investigator person.
 * @param {PersonProps} props the data associated with a given investigator
 * person.
 * @return {ReactElement} the dynamic html for an investigator table row.
 * @constructor
 */
function InvestigatorsRow(props: PersonProps): ReactElement {
    const { selectedProposalCode } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { user } = useContext(ProposalContext);

     /**
     * count PIs 
     * @return number
     * 
     */
    function CheckPiCount(delegateFunction: Function) {
        setSubmitting(true);

        //Are there enough PI's?
        if(PiCount > 1)
        {
            delegateFunction();
        }
        //if there are too few PI's prevent the action
        else{
            lastPiContext();
            setSubmitting(false);
        }

    }


    const removeInvestigatorMutation = useInvestigatorResourceRemoveInvestigator({
        onSuccess: () => {
            setSubmitting(false);
            return queryClient.invalidateQueries();

        },
        onError: (error)=> {
            notifyError("Error deleting", error!.payload);
            setSubmitting(false);
        }
    })

    /**
     * handles the removal of an investigator.
     */
    function handleRemove() {
        setSubmitting(true);
        removeInvestigatorMutation.mutate({pathParams:
                {
                    investigatorId: props.investigator._id!,
                    proposalCode: Number(selectedProposalCode),
                }})
    }


    const changeInvestigatorKindMutation = useInvestigatorResourceChangeInvestigatorKind({
        onSuccess: () => {
            setSubmitting(false);
            /*return queryClient.invalidateQueries({
                    predicate: (query) => {
                        // using 'length === 6' to ensure we get the set of investigators
                        return query.queryKey.length === 6 &&
                            query.queryKey[4] === 'investigators';
                    }});

             */
            queryClient.invalidateQueries().finally();
        },
        onError: (error)=> {
            notifyError("Error changing kind", error!.payload);
            setSubmitting(false);
        }
    })

    /**
     * handles the exchange of an investigator from PI to COI.
     */
    function SwitchInvestigatorKind() {
        if(props.investigator._id == user._id) {
            console.log("Investigator is current user");
        }

        let investigatorTypeSetting:InvestigatorKind = "COI";
        if(props.investigator.type == 'COI')
            investigatorTypeSetting = "PI";

        setSubmitting(true);
        changeInvestigatorKindMutation.mutate({
            pathParams: {
                    investigatorId: props.investigator._id!,
                    proposalCode: Number(selectedProposalCode),
                },
            body: investigatorTypeSetting
            });
    }

    /**
     * gives the user an option to verify if they wish to remove an
     * investigator.
     */

    function HandleSwap()
    {
        if(props.investigator.type == "COI")
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
        if(props.investigator.type == "COI")
        {
            //warn if the user is trying to remove themselves
            if(props.investigator.person?._id == user._id){
                return openRemoveSelfModal();
            }
            //if the target is a coi, allow removal
            return openRemoveModal();


        }
        //if the target is a PI, don't delete, but offer to swap to a COI
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
                    Are you sure you want to remove {props.investigator.person?.fullName} from this proposal?
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
                    Removing yourself from the proposal will prevent you from accessing it in the future.<br/><br/>Be sure this is your intended action before proceeding.
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
                    You can't remove a PI from a proposal.<br/>Would you like to change {props.investigator.person?.fullName} to a COI instead?
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

    if (submitting) {
        return (
            <Table.Tr><Table.Td colSpan={5}>
                Updating...
            </Table.Td></Table.Tr>
        )
    }

    // return the full row.
    return (
        <>
        <Table.Tr>
            <Table.Td>{props.investigator.type}</Table.Td>
            <Table.Td>{props.investigator.person?.fullName}</Table.Td>
            <Table.Td>{props.investigator.person?.eMail}</Table.Td>
            <Table.Td>{props.investigator.person?.homeInstitute?.name}</Table.Td>
            {props.amIaPI && <Table.Td><SwapRoleButton toolTipLabel={"swap role"}
                                    onClick={HandleSwap}
                                     />
            </Table.Td>}
            {props.amIaPI && <Table.Td><DeleteButton toolTipLabel={"delete"}
                                    onClick={HandleDelete} />
            </Table.Td>}
        </Table.Tr>
        
        </>
    )
}
export default InvestigatorsPanel