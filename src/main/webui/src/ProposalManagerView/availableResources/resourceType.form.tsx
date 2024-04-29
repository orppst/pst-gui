import {ReactElement} from "react";
import {Stack, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import {useForm} from "@mantine/form";
import {ResourceTypeFormValues} from "./resourceType.modal.tsx";
import {fetchResourceTypeResourceAddNewResourceType} from "../../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";

export default function ResourceTypeForm(props: ResourceTypeFormValues) : ReactElement {

    interface ResourceTypeValues {
        name: string,
        unit: string
    }

    const queryClient = useQueryClient();

    const form = useForm<ResourceTypeValues>({
        initialValues: {
            name: props.name,
            unit: props.unit
        },

        validate: {
            name: (value) =>
                (value.length < 2 ? 'Name must have at least 2 characters' : null),
            unit: (value) =>
                (value.length < 1 ? 'Please give the resource a unit' : null)
        }
    })

    const handleSubmit = form.onSubmit((values) => {
        //creating a new resource type
        fetchResourceTypeResourceAddNewResourceType({
            body: {
                name: values.name,
                unit: values.unit
            },
            //@ts-ignore
            headers: {"Content-Type": "application/json"}
        })
            .then(() => queryClient.invalidateQueries())
            .then(() => props.closeModal!())
            .then(() => {
                notifications.show({
                    autoClose: 5000,
                    title: "Creation Successful",
                    message: "Added " + values.name + " (" + values.unit + ") to the resource types",
                    color: "green"
                })
            })
            .catch((error) => {
                notifications.show({
                    autoClose: 5000,
                    title: "Creation Failed",
                    message: "Unable to add " + values.name + " (" + values.unit + ") due to: "
                        + getErrorMessage(error),
                    color: "red"
                })
            })
    })

    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                <TextInput
                    label={"Name"}
                    disabled={props.name != ""}
                    description={props.name == "" ? "Give the resource type a name" :
                        "Cannot edit the name of an existing resource type"}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    placeholder={"e.g. compute resource"}
                    {...form.getInputProps('name')}
                />
                <TextInput
                    label={"Unit"}
                    description={props.name == "" ? "Specify a unit for your resource type" :
                        "Edit the unit name"}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    placeholder={"e.g. No. of cores"}
                    {...form.getInputProps('unit')}
                />
                <SubmitButton
                    toolTipLabel={"Save new resource type"}
                    disabled={!form.isDirty() || !form.isValid()}
                />
            </Stack>
        </form>
    )
}

