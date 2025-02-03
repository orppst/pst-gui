import {ReactElement} from "react";
import {useDisclosure} from "@mantine/hooks";
import AddButton from "../../commonButtons/add.tsx";
import {Modal} from "@mantine/core";
import ResourceTypeForm from "./resourceType.form.tsx";
import {ResourceTypeProps} from "./availableResourcesPanel.tsx";

export type ResourceTypeFormValues = {
    name: string,
    unit: string,
    closeModal?: () => void
}

/*
    This requires some effort to get right. Currently, you may add as many ResourceTypes as you wish,
    all with any imagined strings for their "names" and "units". We have no means to edit a ResourceType
    in the API (by design?); you may create or delete a ResourceType only.

    We haven't exposed the ability to delete a ResourceType in the GUI as it may be in use by the Cycle
    as an 'AvailableResource', in which case we'd have to disable the ResourceType delete button.

    Currently, this function is only called with props.resourceTypeId == 'undefined'.
 */

export default function ResourceTypeModal(props: ResourceTypeProps) : ReactElement {

    const [opened, {close, open}] = useDisclosure();

    const NewButton = () : ReactElement => {
        return (
            <AddButton
                toolTipLabel={props.disableAdd ? "All potential resource type slots are filled":"new resource"}
                onClick={open}
                disabled={props.disableAdd}
            />
        )
    }

    const ModalContent = () : ReactElement => {
        return(
            <Modal
                opened={opened}
                onClose={() => close()}
                title={"New Resource Type Form"}
                size={"30%"}
            >
                <ResourceTypeForm
                    name={""}
                    unit={""}
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