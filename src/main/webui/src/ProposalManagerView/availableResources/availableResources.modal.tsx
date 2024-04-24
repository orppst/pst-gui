import {ReactElement} from "react";
import AddButton from "../../commonButtons/add.tsx";
import ViewEditButton from "../../commonButtons/viewEdit.tsx";
import {Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import AvailableResourcesForm from "./availableResources.form.tsx";
import {AvailableResourcesProps} from "./availableResourcesPanel.tsx";

export default function AvailableResourcesModal(props: AvailableResourcesProps) : ReactElement {

    const [opened, {close, open}] = useDisclosure();

    const NewButton = () : ReactElement => {
        return (
            <AddButton toolTipLabel={"new resource"} onClick={open} />
        )
    }

    const EditButton = () : ReactElement => {
        return(
            <ViewEditButton toolTipLabel={"view/edit"} onClick={open} />
        )
    }

    const isNewResource : boolean = !props.resource;

    const ModalContent = () : ReactElement => {
        return(
            <Modal
                opened={opened}
                onClose={props.closeModal? props.closeModal : close}
                title={isNewResource ? "New Resource Form" : "View/Edit Resource Form"}
                size={"30%"}
            >
                <AvailableResourcesForm {...props}/>
            </Modal>
        )
    }

    return(
        <>
            {isNewResource ? <NewButton/> : <EditButton/>}
            <ModalContent />
        </>
    )
}