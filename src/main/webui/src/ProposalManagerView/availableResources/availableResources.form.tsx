import {ReactElement, useEffect, useState} from "react";
import {useForm} from "@mantine/form";
import {AvailableResourcesProps} from "./availableResourcesPanel.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {NumberInput, Select, Stack} from "@mantine/core";
import {
    fetchAvailableResourcesResourceAddCycleResource, fetchAvailableResourcesResourceGetCycleResourceTypes,
    fetchResourceTypeResourceGetAllResourceTypes
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {notifications} from "@mantine/notifications";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";
import {useQueryClient} from "@tanstack/react-query";

export default function AvailableResourcesForm(props: AvailableResourcesProps) :
    ReactElement {

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
            resourceTypeId: undefined,
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
        console.log(values);

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
                    placeholder={"pick one"}
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