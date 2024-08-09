import {ReactElement} from "react";
import ViewEditButton from "src/commonButtons/viewEdit.tsx";
import {Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import JustificationForm from "./justification.form.tsx";
import {JustificationProps} from "./justifications.table.tsx";


function capitalizeFirstChar(string : string) : string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function JustificationsEditModal(justificationProps : JustificationProps)
    : ReactElement {

    const EditButton = () : ReactElement => {
        return (
            <ViewEditButton
                toolTipLabel={"view/edit " + justificationProps.which + " justification"}
                onClick={open}
            />
        )
    }


    const ModalHtml = () : ReactElement => {
        return (
            <Modal
                opened={opened}
                onClose={props.closeModal}
                title={"View/Edit " + capitalizeFirstChar(props.which) + " Justification"}
                //fullScreen
                size="auto"
                height={75}
                centered

            >
                <JustificationForm {...props} />
            </Modal>
        )
    }


    const [opened, {close, open}] = useDisclosure();
    const props = {...justificationProps, closeModal: () =>{close()}}

    return (
        <>
            <EditButton/>
            <ModalHtml/>
        </>
    )
}