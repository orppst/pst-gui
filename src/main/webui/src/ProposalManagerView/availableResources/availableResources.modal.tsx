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
            <AddButton
                toolTipLabel={props.disableAdd ? "All defined resource types used":"new resource"}
                onClick={open}
                disabled={props.disableAdd}
            />
        )
    }

    const EditButton = () : ReactElement => {
        return(
            <ViewEditButton toolTipLabel={"view/edit"} onClick={open} />
        )
    }

    const isNewResource : boolean = !props.resource;
    const formProps = {...props, closeModal: () => {close()}}

    const ModalContent = () : ReactElement => {
        return(
            <Modal
                opened={opened}
                onClose={formProps.closeModal}
                title={isNewResource ? "New Resource Form" : "Edit Resource Form"}
                size={"30%"}
            >
                <AvailableResourcesForm {...formProps}/>
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