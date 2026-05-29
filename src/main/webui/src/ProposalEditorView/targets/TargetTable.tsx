import {
    useProposalResourceGetTarget,
    useProposalResourceRemoveTarget,
} from 'src/generated/proposalToolComponents.ts';

import { Table, Text } from '@mantine/core';
import { CelestialTarget } from 'src/generated/proposalToolSchemas.ts';
import {useQueryClient} from "@tanstack/react-query";
import { ReactElement } from 'react';
import {modals} from "@mantine/modals";
import DeleteButton from "src/commonButtons/delete";
import { TargetProps, TargetTableProps } from './targetProps.tsx';
import { AstroLib } from "@tsastro/astrolib";
import {
    TABLE_HIGH_LIGHT_COLOR
} from 'src/constants.tsx';
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

/**
 * Render a table header suitable for rows made by TargetTableRow()
 *
 * @return {ReactElement} Mantine Table Header Element
 *
 */
function TargetTableHeader(props: TargetTableProps): ReactElement {
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>RA</Table.Th>
                <Table.Th>Dec</Table.Th>
                <Table.Th>Ref. frame</Table.Th>
                <Table.Th>Epoch</Table.Th>
                { props.showButtons && <Table.Th></Table.Th> }
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
function TargetTableRow(props: TargetProps): ReactElement {
    const queryClient = useQueryClient();

    const removeTargetMutation =
        useProposalResourceRemoveTarget();

    const theTarget
        = useProposalResourceGetTarget(
        {pathParams:
                {
                    proposalCode: props.proposalCode,
                    targetId: props.dbid!,
                },
        });

    if(theTarget.isError) {
        return <Table.Tr><Table.Td>Error loading target</Table.Td></Table.Tr>
    }

    /**
     * handles the removal of a target.
     */
    function handleRemove(): void {
        removeTargetMutation.mutate({
            pathParams: {
                proposalCode: props.proposalCode,
                targetId: props.dbid!,
            }
        }, {
            onSuccess: () => {
                notifySuccess("Target deleted", "target has been removed");
                queryClient.invalidateQueries().then();
            }
                ,
            onError: (error) =>
                notifyError("Failed to delete target", getErrorMessage(error))

        })
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
            return "Delete disabled: Target in use by an Observation";
        }
        return "Remove this Target from the Proposal";
    }

    /**
     * function to handle row selection.
     *
     * @param {number | undefined} targetId the target database id that the
     * selected row corresponds to.
     * @constructor
     */
    const RowSelector = (targetId: number | undefined): void => {
        // handle not having a selection method
        if (!props.setSelectedTargetFunction) {
            return;
        }

        // handle selection.
        if(targetId !== undefined) {
                props.setSelectedTargetFunction(targetId);
        }
    }

    const convertMJDToEpoch = (input : number | undefined) : string => {
        //this is not done properly, so beware future dev.
        if (input && input > 50000) {
            return "J2000.0"
        } else {
            return "Unknown"
        }
    }


    /**
     * offers the end user a verification if they wish to remove a target.
     */
    const openRemoveModal = () =>
        modals.openConfirmModal({
            title: "Remove target",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to remove '{theTarget.data?.sourceName}'
                    from this proposal?
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel"},
            confirmProps: { color: "red" },
            onConfirm: () => handleRemove()
        });

    let refFrame : string | undefined = "unknown";
    let ra : string | undefined = "unknown";
    let dec : string | undefined = "unknown";
    let epoch : string | undefined = "unknown";

    if(theTarget.data?.["@type"] === "proposal:CelestialTarget") {
        //console.log(JSON.stringify(data, null, 2));
        const celestialTarget: CelestialTarget = theTarget.data as CelestialTarget;
        //console.log(data);
        if(celestialTarget.coordUnit?.value === "degrees") {
            //DJW: Astrolib DegToHms prepend sign issue
            ra = AstroLib.DegToHms(celestialTarget.coord?.sourceCoordinates?.alpha ?? 0,3).slice(1);
            dec =AstroLib.DegToDms( celestialTarget.coord?.sourceCoordinates?.delta ??0,3);
        } else {
            ra = celestialTarget.coord?.sourceCoordinates?.alpha + " " + celestialTarget.coordUnit?.value;
            dec = celestialTarget.coord?.sourceCoordinates?.delta + " " + celestialTarget.coordUnit?.value;
        }

        refFrame = celestialTarget.coord?.referenceFrame;

        //Bizarre behaviour - positionEpoch: MJD == {value?: number} but using 'value' results in undefined
        // argument being passed - using 'positionEpoch as number' works
        epoch = convertMJDToEpoch(celestialTarget.positionEpoch as number);
    }

    // handle error states.
    if (theTarget.isLoading) {
        return (<Table.Tr><Table.Td>Loading...</Table.Td></Table.Tr>);
    }

    // generate the full row.
    return (
        <Table.Tr onClick={() => {RowSelector(theTarget.data?._id);}}
                  bg={theTarget.data?._id !== undefined && props.selectedTargets?.includes(theTarget.data?._id) ?
                      TABLE_HIGH_LIGHT_COLOR :
                      undefined}>
            <Table.Td>
                {theTarget.data?.sourceName}
            </Table.Td>
                {theTarget.data?.["@type"] ===
                "proposal:CelestialTarget" ?
                    (
                        <>
                        <Table.Td>{ra}</Table.Td>
                        <Table.Td>{dec}</Table.Td>
                        <Table.Td>{refFrame}</Table.Td>
                        <Table.Td>{epoch}</Table.Td>
                        </>
                    )
                    :(<Table.Td colSpan={4}>Unknown</Table.Td>)}
            <Table.Td>
                    {props.showButtons && <
                        DeleteButton toolTipLabel={DeleteToolTip(theTarget.data?._id)}
                                     onClick={openRemoveModal}
                                     disabled={IsBound(theTarget.data?._id)?
                                         true :
                                         undefined}/>}
            </Table.Td>
        </Table.Tr>);
}

/**
 * generates a table for an entire set of targets.
 * @param {TargetTableProps} props the data required to generate the table.
 * @return {React.ReactElement} the html that contains the table.
 * @constructor
 */
export function TargetTable(props: TargetTableProps): ReactElement {
    return (
        <Table
            highlightOnHover
            borderColor={props.borderColor}
        >
            {TargetTableHeader(props)}
            <Table.Tbody>
                {props.isLoading ? (
                        <Table.Tr >
                            <Table.Td>Loading...</Table.Td>
                        </Table.Tr>) :
                    props.data?.map((item) => {
                        return (
                            <TargetTableRow
                                proposalCode={Number(props.selectedProposalCode)}
                                dbid={item.dbid!}
                                key={String(item.dbid!)}
                                showButtons={props.showButtons}
                                boundTargets={props.boundTargets}
                                selectedTargets={props.selectedTargets}
                                setSelectedTargetFunction={props.setSelectedTargetFunction}
                            />)
                    })
                }
            </Table.Tbody>
        </Table>
    )
}