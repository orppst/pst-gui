import {ReactElement, useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {AvailableResourcesProps} from "./availableResourcesPanel.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {NumberInput, Select, Stack} from "@mantine/core";
import {
    fetchAvailableResourcesResourceAddCycleResource,
    fetchAvailableResourcesResourceGetCycleResourceTypes,
    fetchAvailableResourcesResourceUpdateCycleResourceAmount,
    fetchResourceTypeResourceGetAllResourceTypes
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";

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
            })
            .catch((error) => {
                notifications.show({
                    title: "Loading resource types failed",
                    message: "cause: " + getErrorMessage(error),
                    autoClose: 5000,
                    color: 'red'
                })
            })
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
                .then(() => {
                    notifications.show({
                        autoClose: 5000,
                        title: "Update successful",
                        message: "Resource amount updated",
                        color: 'green',
                    });
                })
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
                .catch((error) => {
                    notifications.show({
                        title: "Adding available resource failed",
                        message: "cause: " + getErrorMessage(error),
                        autoClose: 5000,
                        color: 'red'
                    })
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
                <SubmitButton
                    toolTipLabel={"save resource"}
                    disabled={!form.isDirty() || !form.isValid()}
                />
            </Stack>
        </form>
    )
}