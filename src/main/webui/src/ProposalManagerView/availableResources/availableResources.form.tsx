import {ReactElement} from "react";
import {useForm, UseFormReturnType} from "@mantine/form";
import {AvailableResourcesProps} from "./availableResourcesPanel.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {NumberInput, Stack, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";

export default function AvailableResourcesForm(props: AvailableResourcesProps) :
    ReactElement {

    interface AvailableResourcesValues {
        name: string,
        unit: string,
        amount: number
    }

    const form : UseFormReturnType<AvailableResourcesValues> = useForm({
        initialValues: {
            name: props.resource?.type?.name ?? "",
            unit: props.resource?.type?.unit ?? "",
            amount: props.resource?.amount ?? 1
        },

        validate: {
            name: (value) =>
                (value.length < 2 ? 'Name must have at least 2 characters' : null),
            unit: (value) =>
                (value.length < 1 ? 'Please give the resource a unit' : null),
            amount: (value) =>
                (value == undefined || value < 1 ? 'Amount must be strictly positive' : null)
        }
    });

    const handleSubmit = form.onSubmit((values) =>{
        console.log(values);
    })

    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                <TextInput
                    label={"Name"}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    description={
                        MAX_CHARS_FOR_INPUTS -
                        form.values.name.length +
                        "/" + String(MAX_CHARS_FOR_INPUTS)}
                    inputWrapperOrder={[
                        'label', 'error', 'input', 'description']}
                    placeholder={"Give your resource a name"}
                    {...form.getInputProps('name')}
                />
                <TextInput
                    label={"Unit"}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    description={
                        MAX_CHARS_FOR_INPUTS -
                        form.values.unit.length +
                        "/" + String(MAX_CHARS_FOR_INPUTS)}
                    inputWrapperOrder={[
                        'label', 'error', 'input', 'description']}
                    placeholder={"Specify a unit for your resource"}
                    {...form.getInputProps('unit')}
                />
                <NumberInput
                    label={"Amount"}
                    description={"The minimum amount is 1 unit"}
                    min={1}
                    allowNegative={false}
                    {...form.getInputProps('amount')}
                />
                <SubmitButton
                    toolTipLabel={"save resource"}
                    disabled={!form.isDirty() || !form.isValid()}
                />
            </Stack>

        </form>
    )
}