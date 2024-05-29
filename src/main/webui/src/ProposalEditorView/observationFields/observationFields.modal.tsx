import {ReactElement} from "react";
import {useDisclosure} from "@mantine/hooks";
import AddButton from "../../commonButtons/add.tsx";
import ViewEditButton from "../../commonButtons/viewEdit.tsx";
import {Modal} from "@mantine/core";
import {ObservationFieldsProps} from "./ObservationFieldsPanel.tsx";
import ObservationFieldsForm from "./observationFields.form.tsx";

export default function ObservationFieldModal(props: ObservationFieldsProps) : ReactElement {

    const [opened, {close, open}] = useDisclosure();

    const NewButton = () : ReactElement => {
        return (
            <AddButton
                toolTipLabel={"new observation field"}
                onClick={open}
            />
        )
    }

    const EditButton = () : ReactElement => {
        return (
            <ViewEditButton
                toolTipLabel={"view/edit observation field"}
                onClick={open}
            />
        )
    }

    const ModalContent = () : ReactElement => {
        return (
            <Modal
                opened={opened}
                onClose={formProps.closeModal}
                title={isNewObservationField ? "New Observation Field Form" :
                    "Edit Observation Field Form"}
                size={"50%"}
            >
                <ObservationFieldsForm {...formProps}/>
            </Modal>
        )
    }

    const isNewObservationField : boolean = !props.observationField
    const formProps = {...props, closeModal: close}

    return (
        <>
            {isNewObservationField ? <NewButton/> : <EditButton/>}
            <ModalContent/>
        </>
    )
}