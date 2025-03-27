import {ReactElement, useState} from "react";
import {AllocatedBlock, ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {Group, Loader, NumberInput, Switch, Text} from "@mantine/core";
import {
    useAllocatedBlockResourceAddAllocatedBlock,
    useAllocatedBlockResourceUpdateResource,
    useAvailableResourcesResourceGetCycleResourceRemaining,
    useResourceTypeResourceGetResourceType
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {useDebouncedCallback} from "@mantine/hooks";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";

/*
    Rather than filtering by already allocated grades, we present a list of number inputs
    for each Grade in the cycle. These are initially disabled, but can be enabled by a
    checkbox / switch that adds that allocated block to the proposal with a resource amount
    of zero. This can then be adjusted to the desired amount (update method via debounce).
    Disabling the checkbox/switch calls the delete method to remove the block from the
    proposal. This should be hidden behind a "confirm modal".
 */

export default
function AllocatedBlocksContent(p: {
    allocatedBlocks: AllocatedBlock[],
    allocatedProposalId: number,
    observingModeId?: number,
    resourceType: ObjectIdentifier,
    allGrades: ObjectIdentifier[],
}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const {fetcherOptions} = useProposalToolContext();

    //number empty state is the empty string
    const [resourceAmounts, setResourceAmounts] =
        useState<{gradeId: number, amount: string | number}[]>(
            p.allocatedBlocks.map(ab => {
                let gradeId = !ab.grade?._id ? ab.grade as number : ab.grade._id
                return {gradeId: gradeId, amount: ab.resource?.amount!}
            })
        );

    const [addBlockSwitches, setAddBlockSwitches] =
        useState<{gradeId: number, checked: boolean}[]>(
            p.allGrades.map(g => {
                return {
                    gradeId: g.dbid!,
                    checked: !!p.allocatedBlocks
                        .find(ab => ab.grade === g.dbid || ab.grade?._id === g.dbid)
                }
            })
        );

    const addAllocatedBlock =
        useAllocatedBlockResourceAddAllocatedBlock();

    const updateResource =
        useAllocatedBlockResourceUpdateResource();

    const resourceRemaining =
        useAvailableResourcesResourceGetCycleResourceRemaining({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                resourceName: p.resourceType.name!
            }
        })

    const resourceType = useResourceTypeResourceGetResourceType({
        pathParams: {resourceTypeId: p.resourceType.dbid!}
    })

    const handleUpdateDebounce =
        useDebouncedCallback((props:{amount: number, blockId: number}) => {
            updateResource.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    allocatedId: p.allocatedProposalId,
                    blockId: props.blockId
                },
                body: props.amount,
                //@ts-ignore
                headers: {...fetcherOptions.headers, "Content-Type": "text/plain"}
            }, {
                onSuccess: () =>
                    notifySuccess("Updated",
                        "The resource amount changed to " + props.amount),
                onError: (error) =>
                    notifyError("Failed to update resource amount",
                        getErrorMessage(error))
            })
        }, 500)

    const addNewBlock = (gradeId: number) => {
        //new allocation block with zero resource amount
        let newAllocationBlock : AllocatedBlock = {
            "@type": "proposalManagement:AllocatedBlock",
            resource: {
                amount: 0,
                type: {
                    _id: p.resourceType.dbid,
                }
            },
            mode: {
                _id: p.observingModeId
            },
            grade: {
                _id: gradeId
            }
        }

        addAllocatedBlock.mutate({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                allocatedId: p.allocatedProposalId!
            },
            body: newAllocationBlock
        }, {
            onSuccess: () =>
                notifySuccess("Added",
                    "New allocation block has been added to the proposal"),
            onError: (error) =>
                notifyError("Failed add new allocation block",
                    getErrorMessage(error))
        })
    }

    function ResourceAmountInput(props: {
        grade: ObjectIdentifier,
        resourceTypeUnit: string,
        blockId?: number
    }) : ReactElement {

        let checked =
            addBlockSwitches.find(s =>
                s.gradeId === props.grade.dbid)?.checked

        let resourceAmount = resourceAmounts
            .find(ra =>
                ra.gradeId === props.grade.dbid)?.amount

        return (
            <Group>
                <Switch
                    checked={checked}
                    onChange={e => {
                        setAddBlockSwitches(
                            addBlockSwitches.map(abs => {
                                if (abs.gradeId === props.grade.dbid) {
                                    return {...abs, checked: e.currentTarget.checked}
                                } else {
                                    return abs;
                                }
                            })
                        );
                    }}
                    onLabel={"remove"}
                    offLabel={"add"}
                />
                <NumberInput
                    label={"Grade " + props.grade.name}
                    min={0}
                    max={resourceRemaining.data}
                    disabled={props.blockId === undefined}
                    allowNegative={false}
                    clampBehavior={'strict'}
                    value={resourceAmount ?? ''}
                    onChange={(e) => {
                        setResourceAmounts(
                            resourceAmounts.map(ra => {
                                if (ra.gradeId === props.grade.dbid) {
                                    return {...ra, amount: e as number}
                                } else {
                                    return ra
                                }
                            })
                        );
                        handleUpdateDebounce({amount: e as number, blockId: props.blockId!});
                    }}
                />
                <Text>{props.resourceTypeUnit}</Text>
            </Group>
        )
    }

    const DisplayElement = () : ReactElement => {
        return (
            <>
                {
                    //for each grade defined in the Cycle display a number input with a switch
                    p.allGrades.map(g => {

                        let allocatedBlock : AllocatedBlock | undefined =
                            p.allocatedBlocks.find(ab =>
                                ab.grade?._id === g.dbid || ab.grade === g.dbid)

                        return (
                            <ResourceAmountInput
                                grade={g}
                                resourceTypeUnit={resourceType.data?.unit!}
                                blockId={allocatedBlock?._id}
                            />
                        )
                    })
                }
            </>
        )
    }

    if (resourceRemaining.isLoading || resourceType.isLoading) {
        return (
            <Loader />
        )
    }

    if (resourceRemaining.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to get resourceRemaining"}
                error={getErrorMessage(resourceRemaining.error)}
            />
        )
    }

    if (resourceType.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to get resourceType"}
                error={getErrorMessage(resourceType.error)}
            />
        )
    }

    return (
        <DisplayElement/>
    )
}