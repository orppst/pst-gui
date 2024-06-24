import {ReactElement} from "react";
import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {Card, NumberInput, Select, Stack, Text} from "@mantine/core";

export type AllocatedBlockFormProps ={
    allocatedBlock?: AllocatedBlock,
    proposalTitle: string
}

export default
function AllocatedBlockForm(props: AllocatedBlockFormProps) : ReactElement {

    interface AllocatedBlockValues  {
        allocatedBlock: AllocatedBlock | undefined
    }

    const form = useForm<AllocatedBlockValues>({
        initialValues: {
            allocatedBlock: props.allocatedBlock
        }
    })

    let editExisting : boolean = props.allocatedBlock != undefined;


    const resourceAmountInput = () => (
        <NumberInput
            label={"Resource Amount"}
            description={"Can be zero"}
            {...form.getInputProps('allocatedBlock.resource.amount')}
        />
    )

    const resourceTypeInput = () => (
        <Select
            disabled={editExisting}
            label={"Resource Type"}
            placeholder={"Pick one"}
            data={["observation time", "compute resource"]}
            {...form.getInputProps('allocatedBlock.resource.type')}
        />
    )

    const observingModeInput = () => (
        <Select
            label={"Observing Mode"}
            placeholder={"Pick one"}
            data={["L-Band", "C-Band", "K-Band"]}
            {...form.getInputProps('allocatedBlock.mode')}
        />
    )

    const allocationGradeInput = () => (
        <Select
            disabled={editExisting}
            label={"Allocation Grade"}
            placeholder={"Pick one"}
            data={["A", "B"]}
            {...form.getInputProps('allocatedBlock.grade')}
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

    return (
        <form>
            {editExisting &&
                <Card shadow={"sm"} padding={"xs"} radius={"md"} withBorder w={"60%"} m={"lg"}>
                    <Text c={"yellow"} size={"sm"}>
                        When editing an existing allocation block you may only change the resource
                        amount. You cannot change the resource type, the observation mode or the
                        allocation grade. If you need an allocation block with a different resource
                        type, observation mode, or allocation grade please add a new block.
                    </Text>
                </Card>
            }
            {allocatedBlockInputs()}
        </form>
    )
}