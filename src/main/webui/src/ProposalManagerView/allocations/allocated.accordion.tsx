import {ReactElement, useEffect, useState} from "react";
import {Accordion, Fieldset, Group, Loader} from "@mantine/core";
import {
    useAllocatedProposalResourceGetAllocatedProposal, useObservingModeResourceGetObservingModeObjects
} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {AllocationGrade, ObjectIdentifier, ResourceType} from "../../generated/proposalToolSchemas.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AllocatedBlocksTable from "./allocatedBlocks.table.tsx";
import AllocatedBlockModal from "./allocatedBlock.modal.tsx";

type AllocatedItemProps = {
    cycleCode: number,
    allocatedProposalId: number
}

function AllocatedAccordionItem(props: AllocatedItemProps) : ReactElement {

    const [grades, setGrades] = useState<AllocationGrade[]>([]);
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);

    const allocatedProposal =
        useAllocatedProposalResourceGetAllocatedProposal({
            pathParams: {
                cycleCode: props.cycleCode,
                allocatedId: props.allocatedProposalId
            }
        })

    const observingModes =
        useObservingModeResourceGetObservingModeObjects({
            pathParams: {cycleId: props.cycleCode }
        })

    //Hey, have we got an object or a reference? Who TF knows, so we have to do this shit.
    useEffect(() => {
        if (allocatedProposal.status === 'success') {
            let localGrades: AllocationGrade[] = []
            let localResourceType: ResourceType[] = []

            allocatedProposal.data.allocation?.map(ab => {
                if(ab.grade?.name !== undefined) {
                    localGrades.push(ab.grade)
                }

                if(ab.resource?.type?.name !== undefined) {
                    localResourceType.push(ab.resource.type)
                }
            })

            setGrades(localGrades)
            setResourceTypes(localResourceType)
        }
    }, [allocatedProposal.status])


    if (allocatedProposal.isLoading || observingModes.isLoading) {
        return (<Loader/>)
    }

    if (allocatedProposal.error) {
        notifyError("Failed to load Allocated Proposal",
            getErrorMessage(allocatedProposal.error))
    }

    if (observingModes.error) {
        notifyError("Failed to load Allocated Proposal",
            getErrorMessage(observingModes.error))
    }

    return (
        <Accordion.Item value={String(allocatedProposal.data?._id)}>
            <Accordion.Control>
                {allocatedProposal.data?.submitted?.title}
            </Accordion.Control>
            <Accordion.Panel>
                {
                    allocatedProposal.data?.submitted?.config?.map(oc => {
                        //the condition below looks wrong, but it is a product of the api
                        //returning the "thing" on first call then a reference (the DB id)
                        //on subsequent calls
                        let theMode =
                            observingModes.data?.find(om =>
                                om._id === oc.mode?._id || om._id === oc.mode
                            )

                        //key field is a pain in the arse at times - notice we are relying on
                        //observing mode names being unique
                        return (
                            <Fieldset
                                legend={theMode!.name}
                                key={String(allocatedProposal.data?._id) + String(theMode!._id)}
                            >
                                {
                                    allocatedProposal.data?.allocation ?
                                        <AllocatedBlocksTable
                                            allocatedBlocks={allocatedProposal.data.allocation}
                                            proposalTitle={allocatedProposal.data?.submitted?.title!}
                                            allocatedProposalId={allocatedProposal.data._id!}
                                            observingModeId={theMode!._id!}
                                            grades={grades}
                                            resourceTypes={resourceTypes}
                                        /> :
                                        //this is the add button when there is nothing yet allocated
                                        <Group justify={"centre"} grow>
                                            <AllocatedBlockModal
                                                proposalTitle={allocatedProposal.data?.submitted?.title!}
                                                allocatedProposalId={allocatedProposal.data?._id!}
                                                observingModeId={theMode!._id!}
                                            />
                                        </Group>
                                }
                            </Fieldset>
                        )
                    })
                }
            </Accordion.Panel>
        </Accordion.Item>
    )
}


export default
function AllocatedAccordion(props: {allocatedIds: ObjectIdentifier[]}) : ReactElement {

    const {selectedCycleCode} = useParams();

    const allocatedBlocks = props.allocatedIds.map(ap =>(
        <AllocatedAccordionItem
            key={ap.dbid}
            cycleCode={Number(selectedCycleCode)}
            allocatedProposalId={ap.dbid!}
        />
    ))

    return(
        <Accordion defaultValue={"1"} variant={"separated"}>
            {allocatedBlocks}
        </Accordion>
    )
}