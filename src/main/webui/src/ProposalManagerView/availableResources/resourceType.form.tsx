import {ReactElement} from "react";
import {Stack, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS} from "../../constants.tsx";
import {useForm} from "@mantine/form";
import {ResourceTypeFormValues} from "./resourceType.modal.tsx";
import {
    useResourceTypeResourceAddNewResourceType
} from "../../generated/proposalToolComponents.ts";
import {useQueryClient} from "@tanstack/react-query";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";

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

    const addNewResourceTypeMutation = useResourceTypeResourceAddNewResourceType({
        onSuccess: () => {
            queryClient.invalidateQueries().finally();
            props.closeModal!();
            notifySuccess("Creation Successful",
                "Added " + form.values.name + " (" + form.values.unit + ") to the resource types");
        },
        onError: (error) => {
            notifyError("Creation Failed",
                "Unable to add " + form.values.name + " (" + form.values.unit + ") due to: "
                + getErrorMessage(error))
        }
    })

    const handleSubmit = form.onSubmit((values) => {
        //creating a new resource type
        addNewResourceTypeMutation.mutate({
            body: {
                name: values.name,
                unit: values.unit
            }
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
                <FormSubmitButton form={form} />
            </Stack>
        </form>
    )
}

