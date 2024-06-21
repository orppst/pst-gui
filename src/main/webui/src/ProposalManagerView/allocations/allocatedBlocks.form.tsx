import {ReactElement} from "react";
import {AllocatedBlock} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {randomId} from "@mantine/hooks";
import {Accordion, NumberInput, Select, Stack} from "@mantine/core";
import {AccordionDelete} from "../../commonButtons/accordianControls.tsx";

export default
function AllocatedBlocksForm(props: {allocatedBlocks: AllocatedBlock[]}) : ReactElement {

    interface AllocatedBlockValues  {
        allocatedBlocks: AllocatedBlock[]
    }

    const form = useForm<AllocatedBlockValues>({
        initialValues: {
            allocatedBlocks: props.allocatedBlocks
        }
    })

    const empty_allocated_block : AllocatedBlock = {
        _id: 0,
        resource: {
            amount: 0,
            type: undefined
        },
        mode: undefined,
        grade: {
            name: "",
            description: ""
        }
    }


    const resourceAmountInput = (index: number) => (
        <NumberInput
            label={"Resource Amount"}
            description={"Can be zero"}
            {...form.getInputProps(`allocatedBlocks.${index}.resource.amount`)}
        />
    )

    const resourceTypeInput = (index: number) => (
        <Select
            label={"Resource Type"}
            placeholder={"Pick one"}
            data={["observation time", "compute resource"]}
            {...form.getInputProps(`allocatedBlocks.${index}.resource.type`)}
        />
    )

    const observingModeInput = (index: number) => (
        <Select
            label={"Observing Mode"}
            placeholder={"Pick one"}
            data={["L-Band, C-Band, K-Band"]}
            {...form.getInputProps(`allocatedBlocks.${index}.mode`)}
        />
    )

    const allocationGradeInput = (index: number) => (
        <Select
            label={"Allocation Grade"}
            placeholder={"Pick one"}
            data={["A", "B"]}
            {...form.getInputProps(`allocatedBlocks.${index}.grade`)}
        />
    )

    const allocatedBlockList = form.values.allocatedBlocks.map((ab, index) => {
        let labelIndex = index + 1
        return (
            <Accordion.Item
                value={labelIndex.toString()}
                key={ab._id == 0 ? randomId() : ab._id}
            >
                <AccordionDelete
                    title={"Block " + labelIndex}
                    deleteProps={{
                        toolTipLabel: 'delete allocated block',
                        onClick: () => {}
                    }}
                />
                <Accordion.Panel>
                    <Stack>
                        {resourceAmountInput(index)}
                        {resourceTypeInput(index)}
                        {observingModeInput(index)}
                        {allocationGradeInput(index)}
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        )
    })


    return (
        <form>
            <Accordion>
                {allocatedBlockList}
            </Accordion>
        </form>
    )
}