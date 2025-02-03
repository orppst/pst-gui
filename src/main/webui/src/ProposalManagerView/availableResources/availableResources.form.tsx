import {ReactElement, useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {AvailableResourcesProps} from "./availableResourcesPanel.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {NumberInput, Select, Stack} from "@mantine/core";
import {
    useAvailableResourcesResourceAddCycleResource,
    useAvailableResourcesResourceGetCycleResourceTypes,
    useAvailableResourcesResourceUpdateCycleResourceAmount,
    useResourceTypeResourceGetAllResourceTypes
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";

export default function AvailableResourcesForm(props: AvailableResourcesProps) : ReactElement {

    interface AvailableResourcesValues {
        resourceTypeId: number | undefined,
        amount: number
    }

    const {selectedCycleCode} = useParams();
    const queryClient = useQueryClient();

    const [resourceTypeData, setResourceTypeData]
        = useState<{value: string, label: string}[]>([]);

    const resourceTypes = useResourceTypeResourceGetAllResourceTypes({});

    const cycleResourceTypes = useAvailableResourcesResourceGetCycleResourceTypes({
        pathParams: {
            cycleCode: Number(selectedCycleCode)
        }})

    useEffect(() => {
        if(resourceTypes.error || resourceTypes.data == undefined) {
            notifyError("Loading resource types failed",
                "cause: " + getErrorMessage(resourceTypes.error));
        } else if(cycleResourceTypes.error) {
            notifyError("Loading cycle resource types failed",
                "cause: " + getErrorMessage(cycleResourceTypes.error));
        } else {
            //array with resource types in 'allTypes' that are NOT in 'cycleTypes'
            let diff =
                resourceTypes.data.filter(rType => {
                    let result: boolean = false
                    if (cycleResourceTypes.data?.find(cType => cType.dbid == rType.dbid))
                        result = true
                    return !result;
                })
            setResourceTypeData(
                diff?.map((rType) => (
                    {value: String(rType.dbid), label: rType.name!}
                ))
            )
        }
    }, [resourceTypes.data, resourceTypes.status, cycleResourceTypes.data, cycleResourceTypes.status]);

    const form  = useForm<AvailableResourcesValues>({
        initialValues: {
            resourceTypeId: props.resource?.type?._id,
            amount: props.resource?.amount ?? 1
        },
        validate: {
            resourceTypeId: (value) =>
                (value == undefined ? 'Please select a resource type' : null),
            amount: (value) =>
                (value < 1 ? 'Amount must be strictly positive' : null)
        }
    });

    const addCycleResourceMutation = useAvailableResourcesResourceAddCycleResource({
        onSuccess: ()=> {
            queryClient.invalidateQueries().finally(() =>
                props.closeModal!())
        },
        onError: ((error)=>
            notifyError("Adding available resource failed",
                    "cause: " + getErrorMessage(error)))
    })

    const updateCycleResourceMutation = useAvailableResourcesResourceUpdateCycleResourceAmount({
        onSuccess: ()=> {
            queryClient.invalidateQueries().finally(() =>
                props.closeModal!());

            notifySuccess("Update successful",
                "Resource amount updated");
        },
        onError: ((error)=>
            notifyError("Update available resource failed",
                "cause: " + getErrorMessage(error)))
    })

    const handleSubmit = form.onSubmit((values) => {
        if (props.resource) {
            //editing an existing 'available resource' i.e., changing the 'amount' only
            updateCycleResourceMutation.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    resourceId: props.resource._id!
                },
                body: values.amount,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
        } else {
            //adding a new 'available resource'
            addCycleResourceMutation.mutate({
                pathParams: {
                    cycleCode: Number(selectedCycleCode)
                },
                body: {
                    amount: values.amount,
                    type: {
                        "_id": values.resourceTypeId
                    }
                }
            })
        }
    })

    return (
        <form onSubmit={handleSubmit}>
            <Stack>
                <NumberInput
                    label={"Amount"}
                    description={"The minimum amount is 1 unit"}
                    min={1}
                    allowNegative={false}
                    {...form.getInputProps('amount')}
                />
                <Select
                    label={"Resource Type"}
                    disabled={!!props.resource}
                    placeholder={!props.resource ? "pick one" : props.resource.type?.name}
                    description={!props.resource ? "Select a named resource" :
                        "You cannot change an existing resource's type" }
                    data={resourceTypeData}
                    {...form.getInputProps('resourceTypeId')}
                />
                <FormSubmitButton form={form} />
            </Stack>
        </form>
    )
}