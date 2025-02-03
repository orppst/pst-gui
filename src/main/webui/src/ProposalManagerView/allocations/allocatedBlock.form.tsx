import {ReactElement} from "react";
import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {Alert, Group, Loader, NumberInput, Select, Stack} from "@mantine/core";
import {IconInfoCircle} from "@tabler/icons-react";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {
    useAllocatedBlockResourceAddAllocatedBlock,
    useAllocatedBlockResourceUpdateResource,
    useAvailableResourcesResourceGetCycleResourceTypes,
    useObservingModeResourceGetCycleObservingModes,
    useProposalCyclesResourceGetCycleAllocationGrades
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";

export type AllocatedBlockFormProps ={
    proposalTitle: string,
    allocatedProposalId: number,
    allocatedBlock?: AllocatedBlock,
    closeModal?: () => void
}

export default
function AllocatedBlockForm(props: AllocatedBlockFormProps) : ReactElement {
    const {selectedCycleCode} = useParams();

    //mutations
    const addAllocatedBlock =
        useAllocatedBlockResourceAddAllocatedBlock();
    const updateResource =
        useAllocatedBlockResourceUpdateResource();

    //queries
    const getCycleResourceTypes =
        useAvailableResourcesResourceGetCycleResourceTypes({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        });
    const getCycleObservingModes =
        useObservingModeResourceGetCycleObservingModes({
            pathParams: {cycleId: Number(selectedCycleCode)}
        })
    const getCycleAllocationGrades =
        useProposalCyclesResourceGetCycleAllocationGrades({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

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
            data={getCycleResourceTypes.data!.map(t =>
                ({value: String(t.dbid), label: t.name!}))}
            {...form.getInputProps('allocatedBlock.resourceTypeId')}
        />
    )

    const observingModeInput = () => (
        <Select
            disabled={editExisting}
            label={"Observing Mode"}
            placeholder={"Pick one"}
            data={getCycleObservingModes.data!.map(t =>
                ({value: String(t.dbid), label: t.name!}))}
            {...form.getInputProps('allocatedBlock.observingModeId')}
        />
    )

    const allocationGradeInput = () => (
        <Select
            disabled={editExisting}
            label={"Allocation Grade"}
            placeholder={"Pick one"}
            data={getCycleAllocationGrades.data!.map(t =>
                ({value: String(t.dbid), label: t.name!}))}
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
            updateResource.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    allocatedId: props.allocatedProposalId,
                    blockId: props.allocatedBlock?._id!
                },
                body: values.allocatedBlock.amount,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries()
                        .then(() =>
                            notifySuccess("Updated", "The resource amount has been changed")
                        ).then(() => props.closeModal!())
                },
                onError: (error) =>
                    notifyError("Failed to update resource amount",
                        getErrorMessage(error))
            })

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

            addAllocatedBlock.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    allocatedId: props.allocatedProposalId
                },
                body: newAllocationBlock
            }, {
                onSuccess: () => {
                    queryClient.invalidateQueries()
                        .then(() =>
                            notifySuccess("Added",
                                "New allocation block has been added to the proposal")
                        )
                        .then(() => props.closeModal!())
                },
                onError: (error) =>
                    notifyError("Failed add new allocation block",
                    getErrorMessage(error))
            })
        }
    })

    //check the queries before trying to access their data
    if (getCycleAllocationGrades.isLoading || getCycleObservingModes.isLoading ||
        getCycleResourceTypes.isLoading) {
        return (
            <Loader />
        )
    }

    if (getCycleResourceTypes.isError) {
        return (
            <AlertErrorMessage
                title={"Resource Types"}
                error={getCycleResourceTypes.error}
            />)
    }

    if (getCycleObservingModes.isError) {
        return (
            <AlertErrorMessage
                title={"Observing Modes"}
                error={getCycleObservingModes.error}
            />
        )
    }

    if (getCycleAllocationGrades.isError) {
        return (
            <AlertErrorMessage
                title={"Allocation Grades"}
                error={getCycleAllocationGrades.error}
            />
        )
    }

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