import {ReactElement, useEffect, useState} from "react";
import {AllocatedBlock, ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {Alert, Group, NumberInput, Select, Stack} from "@mantine/core";
import {IconInfoCircle} from "@tabler/icons-react";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {
    fetchAllocatedBlockResourceAddAllocatedBlock,
    fetchAllocatedBlockResourceUpdateResource,
    fetchAvailableResourcesResourceGetCycleResourceTypes,
    fetchObservingModeResourceGetCycleObservingModes, fetchProposalCyclesResourceGetCycleAllocationGrades
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";

export type AllocatedBlockFormProps ={
    proposalTitle: string,
    allocatedProposalId: number,
    allocatedBlock?: AllocatedBlock,
    closeModal?: () => void
}

export default
function AllocatedBlockForm(props: AllocatedBlockFormProps) : ReactElement {

    interface AllocatedBlockValues  {
        allocatedBlock: {
            amount: number
            resourceTypeId: string | undefined,
            observingModeId: string | undefined,
            allocationGradeId: string | undefined
        }
    }

    const form = useForm<AllocatedBlockValues>({
        initialValues: {
            allocatedBlock: {
                amount: props.allocatedBlock?.resource?.amount ?? 0,
                resourceTypeId: String(props.allocatedBlock?.resource?.type?._id),
                observingModeId: String(props.allocatedBlock?.mode?._id),
                allocationGradeId: String(props.allocatedBlock?.grade?._id)
            }
        }
    })

    const queryClient = useQueryClient();

    const {selectedCycleCode} = useParams();

    const [resourceTypes, setResourceTypes] =
        useState<{value:string, label:string}[]>([]);

    const [observingModes, setObservingModes] =
        useState<{value:string, label:string}[]>([]);

    const [allocationGrades, setAllocationGrades] =
        useState<{value:string, label:string}[]>([]);

    useEffect(() => {
        fetchAvailableResourcesResourceGetCycleResourceTypes({
            pathParams: {cycleCode:Number(selectedCycleCode)}
        })
            .then((data: ObjectIdentifier[]) => {
                setResourceTypes(
                    data?.map(t => (
                        {value: String(t.dbid), label: t.name!}
                    ))
                )
            })
            .catch(error => notifyError("Failed to load resource types",
                getErrorMessage(error)))

        fetchObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: Number(selectedCycleCode)}
        })
            .then((data: ObjectIdentifier[]) => {
                setObservingModes(
                    data?.map(m => (
                        {value: String(m.dbid), label: m.name!}
                    ))
                )
            })
            .catch(error => notifyError("Failed to load observing modes",
                getErrorMessage(error)))


        fetchProposalCyclesResourceGetCycleAllocationGrades({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })
            .then((data: ObjectIdentifier[]) => {
                setAllocationGrades(
                    data?.map(g => (
                        {value: String(g.dbid), label: g.name!}
                    ))
                )
            })
            .catch(error => notifyError("Failed to load allocation grades",
                getErrorMessage(error)))
    }, []);



    let editExisting : boolean = props.allocatedBlock != undefined;

    const resourceAmountInput = () => (
        <NumberInput
            allowNegative={false}
            label={"Resource Amount"}
            description={"Can be zero"}
            {...form.getInputProps('allocatedBlock.amount')}
        />
    )

    const resourceTypeInput = () => (
        <Select
            disabled={editExisting}
            label={"Resource Type"}
            placeholder={"Pick one"}
            data={resourceTypes}
            {...form.getInputProps('allocatedBlock.resourceTypeId')}
        />
    )

    const observingModeInput = () => (
        <Select
            disabled={editExisting}
            label={"Observing Mode"}
            placeholder={"Pick one"}
            data={observingModes}
            {...form.getInputProps('allocatedBlock.observingModeId')}
        />
    )

    const allocationGradeInput = () => (
        <Select
            disabled={editExisting}
            label={"Allocation Grade"}
            placeholder={"Pick one"}
            data={allocationGrades}
            {...form.getInputProps('allocatedBlock.allocationGradeId')}
        />
    )

    const allocatedBlockInputs = () => (
        <Stack>
            {resourceAmountInput()}
            {resourceTypeInput()}
            {observingModeInput()}
            {allocationGradeInput()}
        </Stack>
    )

    const handleSubmit = form.onSubmit(values => {
        if (editExisting) {
            //users may only change the resource amount
            fetchAllocatedBlockResourceUpdateResource({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    allocatedId: props.allocatedProposalId,
                    blockId: props.allocatedBlock?._id!
                },
                body: values.allocatedBlock.amount,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
                .then(() => queryClient.invalidateQueries())
                .then(() => props.closeModal!())
                .then(() => notifySuccess("Updated",
                    "The resource amount has been changed"))
                .catch(error => notifyError("Failed to update resource amount",
                    getErrorMessage(error)))
        } else {
            //new allocation block
            let newAllocationBlock : AllocatedBlock = {
                "@type": "proposalManagement:AllocatedBlock",
                resource: {
                    amount: values.allocatedBlock.amount,
                    type: {
                        _id: Number(values.allocatedBlock.resourceTypeId)
                    }
                },
                mode: {
                    _id: Number(values.allocatedBlock.observingModeId)
                },
                grade: {
                    _id: Number(values.allocatedBlock.allocationGradeId)
                }
            }

            fetchAllocatedBlockResourceAddAllocatedBlock({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    allocatedId: props.allocatedProposalId
                },
                body: newAllocationBlock
            })
                .then(() => queryClient.invalidateQueries())
                .then(() => props.closeModal!())
                .then(() => notifySuccess("Added",
                    "New allocation block has been added to the proposal"))
                .catch(error => notifyError("Failed to update resource amount",
                    getErrorMessage(error)))
        }
    })

    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                {editExisting &&
                    <Group justify={"center"}>
                        <Alert
                            variant={"light"}
                            color={"blue"}
                            title={"You can only edit the resource amount"}
                            icon={<IconInfoCircle/>}
                            m={20}
                        >
                            When editing an existing allocation block you may only change the resource
                            amount. You cannot change the resource type, the observation mode or the
                            allocation grade. If you need an allocation block with a different resource
                            type, observation mode, or allocation grade please add a new block.
                        </Alert>
                    </Group>
                }
                {allocatedBlockInputs()}
                <SubmitButton
                    toolTipLabel={"save changes"}
                    disabled={!form.isDirty() || !form.isValid()}
                />
            </Stack>
        </form>
    )
}