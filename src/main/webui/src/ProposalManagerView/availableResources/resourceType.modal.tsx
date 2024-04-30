import {ReactElement, useEffect, useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import AddButton from "../../commonButtons/add.tsx";
import {Modal} from "@mantine/core";
import ResourceTypeForm from "./resourceType.form.tsx";
import {ResourceTypeProps} from "./availableResourcesPanel.tsx";
import {fetchResourceTypeResourceGetResourceType} from "../../generated/proposalToolComponents.ts";
import {ResourceType} from "../../generated/proposalToolSchemas.ts";

export type ResourceTypeFormValues = {
    name: string,
    unit: string,
    closeModal?: () => void
}

export default function ResourceTypeModal(props: ResourceTypeProps) : ReactElement {

    const [opened, {close, open}] = useDisclosure();

    const [resourceType, setResourceType]
        = useState<ResourceType>({name: "", unit: ""});

    useEffect(() => {
        if (props.resourceTypeId)
            fetchResourceTypeResourceGetResourceType({
                pathParams: {
                    resourceTypeId: props.resourceTypeId
                }
            })
                .then(rType => {
                    console.log("resource type found: " + rType.name)
                    setResourceType({name: rType.name!, unit: rType.unit!})
                })
    }, []);


    const NewButton = () : ReactElement => {
        return (
            <AddButton
                toolTipLabel={props.disableAdd ? "All potential resource type slots are filled":"new resource"}
                onClick={open}
                disabled={props.disableAdd}
            />
        )
    }


    const isNewResourceType : boolean = !props.resourceTypeId;

    const ModalContent = () : ReactElement => {
        return(
            <Modal
                opened={opened}
                onClose={() => close()}
                title={isNewResourceType ? "New Resource Type Form" : "Edit Resource Type Form"}
                size={"30%"}
            >
                <ResourceTypeForm
                    name={resourceType.name!}
                    unit={resourceType.unit!}
                    closeModal={() => close()}
                />
            </Modal>
        )
    }

    return(
        <>
            <NewButton/>
            <ModalContent />
        </>
    )
}