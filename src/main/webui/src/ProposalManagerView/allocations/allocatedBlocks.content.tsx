import {ReactElement, useEffect, useState} from "react";
import {AllocatedBlock, ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {Group, Loader, NumberInput, Text} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
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
    const [resourceAmount, setResourceAmount] = useState<string | number>('');

    const [allocatedGrades, setAllocatedGrades] = useState<ObjectIdentifier[]>([]);

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

    //another game of "object or reference?". If the 'grade' is a reference then we'll need to
    //compare by dbid to 'allGrades' to get the ObjectIdentifier.
    useEffect(() => {
        setAllocatedGrades(
            p.allocatedBlocks.map(ab => {
                if (ab.grade?.name === undefined) {
                    //grade is a reference and will be contained in allGrades
                    return p.allGrades.find(g => g.dbid === ab.grade!)!;
                } else {
                    //grade is the object
                    return {dbid: ab.grade._id!, name: ab.grade.name!};
                }
            })
        )
    }, []);

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
        gradeName: string,
        resourceTypeUnit: string,
        blockId: number
    }) : ReactElement {

        return (
            <Group>
                <NumberInput
                    label={"Grade " + props.gradeName}
                    min={0}
                    max={resourceRemaining.data}
                    allowNegative={false}
                    clampBehavior={'strict'}
                    value={resourceAmount}
                    onChange={(e) =>{
                        setResourceAmount(e);
                        handleUpdateDebounce({amount: e as number, blockId: props.blockId});
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
                    //display a NumberInput for each allocatedBlock associated with the proposal
                    p.allocatedBlocks.map(ab => {
                        let gradeName : string = ab.grade?.name ?? ""

                        if (gradeName === "") {
                            gradeName = p.allGrades.find(o => o.dbid === ab.grade)?.name!
                        }

                        return (
                            <ResourceAmountInput
                                gradeName={gradeName}
                                resourceTypeUnit={resourceType.data?.unit!}
                                blockId={ab._id!}
                                key={String(ab._id)}
                            />
                        )
                    })
                }
                {
                    //return a list of "Add" buttons for the grades yet to be allocated
                    p.allGrades
                        .filter(g => {
                            console.log(allocatedGrades)
                            return !allocatedGrades.includes(g)
                        })
                        .map(grade => {
                        return (
                            <AddButton
                                toolTipLabel={"add resource for grade " + grade.name}
                                label={"Add Grade " + grade.name}
                                onClick={() => addNewBlock(grade.dbid!)}
                                key={String(grade.dbid)}
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