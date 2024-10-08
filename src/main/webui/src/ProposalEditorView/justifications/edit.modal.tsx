import {ReactElement} from "react";
import ViewEditButton from "src/commonButtons/viewEdit.tsx";
import {Modal} from "@mantine/core";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import JustificationForm from "./justification.form.tsx";
import {JustificationProps} from "./justifications.table.tsx";


function capitalizeFirstChar(string : string) : string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function JustificationsEditModal(justificationProps : JustificationProps)
    : ReactElement {

    const isMobile = useMediaQuery('(max-width: 75em)');

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
                fullScreen={isMobile}
                size="60%"
            >
                <JustificationForm {...props} />
            </Modal>
        )
    }

    const [opened, {close, open}] = useDisclosure();
    const props = {
        ...justificationProps,
        closeModal: () =>{
            close();
            justificationProps.onChange(); //trigger re-fetch of justifications, something may have changed
        }}

    return (
        <>
            <EditButton/>
            <ModalHtml/>
        </>
    )
}