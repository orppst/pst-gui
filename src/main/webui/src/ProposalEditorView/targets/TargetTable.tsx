import {
    fetchProposalResourceRemoveTarget,
    useProposalResourceGetTarget,
} from 'src/generated/proposalToolComponents.ts';

import { Table, Text, useMantineTheme } from '@mantine/core';
import { CelestialTarget } from 'src/generated/proposalToolSchemas.ts';
import {useQueryClient} from "@tanstack/react-query";
import { ReactElement, useState } from 'react';
import {modals} from "@mantine/modals";
import DeleteButton from "src/commonButtons/delete";
import { TargetProps, TargetTableProps } from './targetProps.tsx';
import { AstroLib } from "@tsastro/astrolib";
import {    ERROR_YELLOW,
    TABLE_HIGH_LIGHT_COLOR
} from 'src/constants.tsx';
import {notifyError} from "../../commonPanel/notifications.tsx";
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
                <Table.Th>Reference system</Table.Th>
                <Table.Th>RA</Table.Th>
                <Table.Th>Dec</Table.Th>
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
        notifyError("Error deleting", getErrorMessage(error));
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
            .then(()=> {
                setSubmitting(false);
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
           // ra = celestialTarget.sourceCoordinates?.lat?.value+"°";
            ra = AstroLib.DegToHms(celestialTarget.sourceCoordinates?.lat.value?? 0)
        else
            ra = celestialTarget.sourceCoordinates?.lat?.value + " " +
                celestialTarget.sourceCoordinates?.lat?.unit?.value;

        if(celestialTarget.sourceCoordinates?.lon?.unit?.value === "degrees")
            dec =AstroLib.DegToDms( celestialTarget.sourceCoordinates?.lon.value ??0);
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
                  bg={data?._id !== undefined && props.selectedTargets?.includes(data?._id) ?
                      TABLE_HIGH_LIGHT_COLOR :
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
                    {props.showButtons && <
                        DeleteButton toolTipLabel={DeleteToolTip(data?._id)}
                                     onClick={openRemoveModal}
                                     disabled={IsBound(data?._id)?
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
    const theme = useMantineTheme();
    return (
        <Table highlightOnHover borderColor={
                props.selectedTargets?.length === 0 ?
                    theme.colors.yellow[ERROR_YELLOW]:
                    undefined}>
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