import {ReactElement} from "react";
import ViewEditButton from "../commonButtons/viewEdit.tsx";
import {Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import JustificationForm from "./justification.form.tsx";
import {JustificationProps} from "./justifications.table.tsx";


const [opened, {close, open}] = useDisclosure();

const ModalHtml = (props : JustificationProps) : ReactElement => {
    return (
        <Modal
            opened={opened}
            onClose={props.closeModal!}
            title={"View/Edit " + props.which + " Justification"}
            fullScreen
        >
            <JustificationForm {...props} />
        </Modal>
    )
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

    const props = {...justificationProps, closeModal: () =>{close()}}

    return (
        <>
            <EditButton/>
            <ModalHtml {...props}/>
        </>
    )
}