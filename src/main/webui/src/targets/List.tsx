import {
    fetchProposalResourceRemoveTarget, useProposalResourceGetTarget,
    useProposalResourceGetTargets,
} from "../generated/proposalToolComponents.ts";

import AddTargetModal from "./New";
import {useParams} from "react-router-dom";
import { Box, Table, Text } from '@mantine/core';
import {randomId} from "@mantine/hooks";
import {CelestialTarget} from "../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";
import { ReactElement, useState } from 'react';
import {modals} from "@mantine/modals";
import DeleteButton from "../commonButtons/delete";

/**
 * target prop.
 * @param proposalCode the id for the proposal this target is linked to.
 * @param dbid the database id for this target.
 * @param showRemove boolean saying if this target can be removed.
 * @param key: forced upon us.
 */
type TargetProps = {
    proposalCode: number,
    dbid: number,
    showRemove: boolean,
    key: string };

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

    if (error) {
        return (
            <Box>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </Box>
        );
    }

    return (
            <Box>
                <Text fz="lg" fw={700}>Add and edit targets</Text>
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
        fetchProposalResourceRemoveTarget({pathParams:
                {
                    proposalCode: props.proposalCode,
                    targetId: props.dbid!
                }})
            .then(()=>setSubmitting(false))
            .then(()=>queryClient.invalidateQueries())
            .catch(handleError);
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

    return (
        <Table.Tr key={props.dbid}>
            {isLoading?(<Table.Td>Loading...</Table.Td>):
                submitting?(<Table.Td>Removing...</Table.Td>):
                    (<>
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
                                    DeleteButton toolTipLabel={"delete"}
                                                 onClick={openRemoveModal} />}
                            </Table.Td>
                        </>
                    )}
                </Table.Tr>);
}

export default TargetPanel