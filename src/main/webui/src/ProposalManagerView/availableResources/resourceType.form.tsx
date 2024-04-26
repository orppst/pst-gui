import {ReactElement} from "react";
import {TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import {useForm} from "@mantine/form";

export default function ResourceTypeForm() : ReactElement {

    interface ResourceTypeValues {
        name: string,
        unit: string
    }

    const form = useForm<ResourceTypeValues>({
        initialValues: {
            name: "",
            unit: ""
        },

        validate: {
            name: (value) =>
                (value.length < 2 ? 'Name must have at least 2 characters' : null),
            unit: (value) =>
                (value.length < 1 ? 'Please give the resource a unit' : null)
        }
    })

    const handleSubmit = () => form.onSubmit((values) => {
        console.log(values)
    })

    return (
        <form onSubmit={handleSubmit}>
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
        </form>
    )
}

