import {
    fetchProposalResourceRemoveTarget,
    useProposalResourceGetObservingProposal,
    useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from '../generated/proposalToolComponents.ts';

import AddTargetModal from "./New";
import {useParams} from "react-router-dom";
import { Box, Table, Text } from '@mantine/core';
import {randomId} from "@mantine/hooks";
import { CelestialTarget } from '../generated/proposalToolSchemas.ts';
import {useQueryClient} from "@tanstack/react-query";
import { ReactElement, useState } from 'react';
import {modals} from "@mantine/modals";
import DeleteButton from "../commonButtons/delete";
import { TargetProps } from './targetProps.tsx';
import { HEADER_FONT_WEIGHT, JSON_SPACES } from '../constants.tsx';
import { useHistoryState } from '../useHistoryState.ts';

/**
 * Renders the target panel containing an add target button
 * (from the add target modal) and a table of targets assigned to the
 * current proposal
 *
 *
 * @return {ReactElement} Returns a Mantine Box
 */
function TargetPanel(): ReactElement {
    const {selectedProposalCode} = useParams();
    const {data, error, isLoading} = useProposalResourceGetTargets(
            {pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true});
    // needed to track which targets are locked into observations.
    const { data: proposalsData } =
        useProposalResourceGetObservingProposal({
                pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true}
        );
    const [selectedRow, setSelectedRow] =
        useHistoryState("selectedTargetId", -1);

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    // acquire all the bound targets ids in observations.
    let boundTargets: (number | undefined)[] | undefined = [];
    boundTargets = proposalsData?.observations?.map((observation) => {
        // extract the id. it seems the technical Goal returned here IS a number
        // not the TechnicalGoal object it advertises.
        return observation.target as number;
    });

    return (
            <Box>
                <Text fz="lg"
                      fw={HEADER_FONT_WEIGHT}>
                    Add and edit targets
                </Text>
                <Box>
                    <AddTargetModal/>
                    {data?.length === 0?
                        <div>Please add your targets</div> :
                        <Table>
                            <TargetTableHeader/>
                            <Table.Tbody>
                                {isLoading ? (
                                        <Table.Tr colSpan={5} key={randomId()}>
                                            <Table.Td>Loading...</Table.Td>
                                        </Table.Tr>) :
                                    data?.map((item) => {
                                            return (
                                                <TargetTableRow
                                                        proposalCode={Number(selectedProposalCode)}
                                                        dbid={item.dbid!}
                                                        showRemove={true}
                                                        key={randomId()}
                                                        boundTargets={boundTargets}
                                                        selectedTarget={selectedRow}
                                                        setSelectedTarget={setSelectedRow}
                                                />)
                                    })
                                }
                            </Table.Tbody>
                        </Table>}
                </Box>
            </Box>
        );
}

/**
 * Render a table header suitable for rows made by TargetTableRow()
 *
 * @return {ReactElement} Mantine Table Header Element
 *
 */
export function TargetTableHeader(): ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Reference system</Table.Th>
                <Table.Th>RA</Table.Th>
                <Table.Th>Dec</Table.Th>
                <Table.Th>Epoch</Table.Th>
            </Table.Tr>
        </Table.Thead>
    );
}

/**
 * Render the contents of table row for a given target
 *
 * @return {ReactElement} Returns a mantine Table Row Element
 * @param {TargetProps} props the data associated with a target.
 */
export function TargetTableRow(props: TargetProps): ReactElement {
    const queryClient = useQueryClient();
    const [submitting, setSubmitting] = useState(false);

    console.debug(`get target id of ${props.dbid}`)
    const {data, error, isLoading}
        = useProposalResourceGetTarget(
        {pathParams:
                {
                    proposalCode: props.proposalCode,
                    targetId: props.dbid!,
                },
        });

    if(error) {
        return <Table.Tr><Table.Td>Error loading target</Table.Td></Table.Tr>
    }

    //Errors come in as name: "unknown", message: "Network Error" with an
    // object called "stack" that contains the exception and message set in
    // the API when the exception is thrown
    const handleError = (error: { stack: { message: any; }; }) => {
        console.error(error);
        alert(error.stack.message);
        setSubmitting(false);
    }

    /**
     * handles the removal of a target.
     */
    function handleRemove(): void {
        setSubmitting(true);
        console.debug(`start delete of target ${props.dbid}`);
        fetchProposalResourceRemoveTarget({pathParams:
                {
                    proposalCode: props.proposalCode,
                    targetId: props.dbid!
                }})
            .then(()=> {
                setSubmitting(false);
                console.debug("delete complete");
                return queryClient.invalidateQueries(
                    {
                        predicate: (query) => {
                            // only invalidate the query for the entire target
                            // list. not the separate bits.
                            return query.queryKey.length === 5 &&
                                query.queryKey[4] === 'targets';
                        }
                    }
                )
            })
            .catch(handleError);
    }

    /**
     * checks if the technical goal is used within any observation.
     * If so, the delete button is disabled.
     */
    const IsBound = (target: number | undefined): boolean => {
        return props.boundTargets?.includes(target as number) as boolean;
    }

    /**
     * provides a tool tip for the delete button. Changing based off if the
     * target is tied to an observation.
     *
     * @param {number | undefined} target the target id.
     * @return {string} the tooltip contents.
     * @constructor
     */
    const DeleteToolTip = (target: number | undefined): string => {
        if (IsBound(target)) {
            return "Please remove this target from corresponding observations.";
        }
        return "Click to delete this target from the set";
    }

    /**
     * offers the end user a verification if they wish to remove a target.
     */
    const openRemoveModal = (): void =>
        modals.openConfirmModal({
            title: "Remove target",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove '{data?.sourceName}'
                    from this proposal?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel"},
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove()
        });

    const RowSelector = (targetId: number | undefined): void => {
        console.log(`row ${targetId} was selected`);
        if (props.selectedTarget === targetId) {
            props.setSelectedTarget!(-1);
        } else {
            props.setSelectedTarget!(targetId!);
        }
    }

    let spaceFrame : string | undefined = "unknown";
    let ra : string | undefined = "unknown";
    let dec : string | undefined = "unknown";
    let epoch : string | undefined = "unknown";

    if(data?.["@type"] === "proposal:CelestialTarget") {
        //console.log(JSON.stringify(data, null, 2));
        const celestialTarget: CelestialTarget = data as CelestialTarget;

        if(celestialTarget.sourceCoordinates?.lat?.unit?.value === "degrees")
            ra = celestialTarget.sourceCoordinates?.lat?.value+"°";
        else
            ra = celestialTarget.sourceCoordinates?.lat?.value + " " +
                celestialTarget.sourceCoordinates?.lat?.unit?.value;

        if(celestialTarget.sourceCoordinates?.lon?.unit?.value === "degrees")
            dec = celestialTarget.sourceCoordinates?.lon?.value+"°";
        else
            dec = celestialTarget.sourceCoordinates?.lon?.value + " " +
                celestialTarget.sourceCoordinates?.lon?.unit?.value;

        if(celestialTarget.sourceCoordinates?.coordSys?.["@type"] ===
            "coords:SpaceSys") {
            spaceFrame = celestialTarget.sourceCoordinates?.coordSys?.frame?.spaceRefFrame;
        }
        epoch = celestialTarget.positionEpoch?.value;
    }

    // handle error states.
    if (isLoading) {
        return (<Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>);
    } else if (submitting) {
        return (<Table.Tr><Table.Td>Removing...</Table.Td></Table.Tr>);
    }

    // generate the full row.
    return (
        <Table.Tr onClick={() => {RowSelector(data?._id);}}
                  bg={props.selectedTarget === data?._id ?
                      'var(--mantine-color-blue-light)' :
                      undefined}>
            <Table.Td>
                {data?.sourceName}
            </Table.Td>
                {data?.["@type"] ===
                "proposal:CelestialTarget" ?
                    (<><Table.Td>{spaceFrame}</Table.Td>
                    <Table.Td>{ra}</Table.Td>
                    <Table.Td>{dec}</Table.Td>
                    <Table.Td>{epoch}</Table.Td></>
                    )
                    :(<Table.Td colSpan={4}>Unknown</Table.Td>)}
            <Table.Td>
                    {props.showRemove && <
                        DeleteButton toolTipLabel={DeleteToolTip(data?._id)}
                                     onClick={openRemoveModal}
                                     disabled={IsBound(data?._id)?
                                         true :
                                         undefined}/>}
            </Table.Td>
        </Table.Tr>);
}

export default TargetPanel