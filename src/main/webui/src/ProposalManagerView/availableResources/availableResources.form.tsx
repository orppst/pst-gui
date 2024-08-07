import {ReactElement, useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {AvailableResourcesProps} from "./availableResourcesPanel.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {NumberInput, Select, Stack} from "@mantine/core";
import {
    fetchAvailableResourcesResourceAddCycleResource,
    fetchAvailableResourcesResourceGetCycleResourceTypes,
    fetchAvailableResourcesResourceUpdateCycleResourceAmount,
    fetchResourceTypeResourceGetAllResourceTypes
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
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

    useEffect(() => {
        fetchResourceTypeResourceGetAllResourceTypes({})
            .then((allTypes: ObjectIdentifier[]) => {
                fetchAvailableResourcesResourceGetCycleResourceTypes({
                    pathParams: {
                        cycleCode: Number(selectedCycleCode)
                    }
                })
                    .then((cycleTypes: ObjectIdentifier[]) => {
                        //array with resource types in 'allTypes' that are NOT in 'cycleTypes'
                        let diff =
                            allTypes.filter(rType => {
                                let result : boolean = false
                                if(cycleTypes.find(cType => cType.dbid == rType.dbid))
                                    result = true
                                return !result;
                            })
                        setResourceTypeData(
                            diff?.map((rType)=> (
                                {value: String(rType.dbid), label: rType.name!}
                            ))
                        )
                    })
                    .catch((error) => notifyError("Loading cycle resource types failed",
                        "cause: " + getErrorMessage(error)))
            })
            .catch((error) => notifyError("Loading resource types failed",
                "cause: " + getErrorMessage(error)))
    }, []);

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

    const handleSubmit = form.onSubmit((values) => {
        if (props.resource) {
            //editing an existing 'available resource' i.e., changing the 'amount' only
            fetchAvailableResourcesResourceUpdateCycleResourceAmount({
                pathParams: {
                    cycleCode: Number(selectedCycleCode),
                    resourceId: props.resource._id!
                },
                body: values.amount,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            })
                .then(()=>queryClient.invalidateQueries())
                .then( () => props.closeModal!() )
                .then(() => notifySuccess("Update successful",
                    "Resource amount updated"))
        } else {
            //adding a new 'available resource'
            fetchAvailableResourcesResourceAddCycleResource({
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
                .then( ()=>queryClient.invalidateQueries() )
                .then( () => props.closeModal!() )
                .catch((error) => notifyError("Adding available resource failed",
                    "cause: " + getErrorMessage(error)))
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