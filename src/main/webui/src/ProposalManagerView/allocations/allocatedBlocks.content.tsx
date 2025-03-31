import {ReactElement, useState} from "react";
import {AllocatedBlock, ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {Loader, NumberInput, Table, Tooltip} from "@mantine/core";
import {
    useAllocatedBlockResourceUpdateResource,
    useAvailableResourcesResourceGetCycleResourceRemaining
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useParams} from "react-router-dom";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";
import {useDebouncedCallback} from "@mantine/hooks";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";

/*
    Dev note: this code assumes that an allocated proposal was assigned all its potential
    allocation blocks with zero resource at the point where a submitted proposal is "passed"
    to be an allocated proposal. Notice, this may not be true for proposals created during
    setup i.e., outside this GUI.
 */

export default
function AllocatedBlocksContent(p: {
    allocatedBlocks: AllocatedBlock[],
    allocatedProposalId: number,
    observingModeId: number,
    numberObservations: number,
    resourceTypeName: string,
    allGrades: ObjectIdentifier[],
    modeName: string,
    proposalTitle: string
}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const {fetcherOptions} = useProposalToolContext();

    const queryClient = useQueryClient();

    const [amountErrors, setAmountErrors] =
        useState<{blockId: number, message: string}[]>(
            p.allocatedBlocks.map(ab => {
                return {blockId: ab._id!, message: ''}
            })
        );

    //number empty state is the empty string
    const [resourceAmounts, setResourceAmounts] =
        useState<{blockId: number, amount: string | number}[]>(
            p.allocatedBlocks.map(ab => {
                return {blockId: ab._id!, amount: ab.resource?.amount!}
            })
        );

    const updateResource =
        useAllocatedBlockResourceUpdateResource();

    const resourceRemaining =
        useAvailableResourcesResourceGetCycleResourceRemaining({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                resourceName: p.resourceTypeName
            }
        })

    const handleUpdateDebounce =
        useDebouncedCallback((props:{
            amount: number,
            blockId: number,
            proposalTitle: string,
            modeName: string,
            gradeName: string
        }) => {
            updateResource.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    allocatedId: p.allocatedProposalId,
                    blockId: props.blockId
                },
                body: props.amount === 0 ? '0' : props.amount,
                //@ts-ignore
                headers: {...fetcherOptions.headers, "Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries().then(() =>
                        notifySuccess("Updated '" + props.proposalTitle + "'",
                            props.modeName + ", grade " +  props.gradeName
                            + " resource amount changed to " + props.amount)
                    )
                },
                onError: (error) =>
                    notifyError("Failed to update resource amount",
                        getErrorMessage(error))
            })
        }, 1000)

    function ResourceAmountInput(props: {
        grade: ObjectIdentifier,
        resourceAmount: number,
        blockId?: number
    }) : ReactElement {

        let resourceAmount = resourceAmounts
            .find(ra => ra.blockId === props.blockId)?.amount

        let errorMsg = amountErrors
            .find(e => e.blockId === props.blockId)?.message

        let toolTipLabel : string = "Grade " + props.grade.name
            + " == " + props.grade.code

        return (
            <Tooltip label={toolTipLabel} openDelay={1000}>
                <NumberInput
                    error={errorMsg}
                    min={0}
                    max={resourceRemaining.data! + props.resourceAmount}
                    clampBehavior={'strict'}
                    disabled={props.blockId === undefined}
                    allowNegative={false}
                    value={resourceAmount}
                    onChange={(e) => {
                        setResourceAmounts(
                            resourceAmounts.map(ra => {
                                return ra.blockId === props.blockId ?
                                    {...ra, amount: e} : ra
                            })
                        );
                        if (e !== '') {
                            setAmountErrors(
                                amountErrors.map(ae => {
                                    return ae.blockId === props.blockId ?
                                        {...ae, message: ""} : ae
                                }))
                            handleUpdateDebounce({
                                amount: e as number,
                                blockId: props.blockId!,
                                proposalTitle: p.proposalTitle,
                                modeName: p.modeName,
                                gradeName: props.grade.name!
                            });
                        }

                    }}
                    onBlur={() => {
                        if (resourceAmount === '') {
                            setAmountErrors(
                                amountErrors.map(e => {
                                    return e.blockId === props.blockId ?
                                        {...e, message: "Please provide a value"} : e
                                })
                            )
                        }
                    }}
                />
            </Tooltip>
        )
    }

    if (resourceRemaining.isLoading) {
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

    return (
        <>
            {
                p.allocatedBlocks.map(ab => {
                    let grade = p.allGrades.find(g =>
                        ab.grade === g.dbid || ab.grade?._id === g.dbid
                    )

                    return (
                        <Table.Td key={ab._id}>
                            {
                                ResourceAmountInput({
                                    grade: grade!,
                                    resourceAmount: ab.resource?.amount!,
                                    blockId: ab._id
                                })
                            }
                        </Table.Td>
                    )
                })
            }
        </>
    )
}