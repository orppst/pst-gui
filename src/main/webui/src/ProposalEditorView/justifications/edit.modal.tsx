import {ReactElement, useState} from "react";
import ViewEditButton from "src/commonButtons/viewEdit.tsx";
import {Modal, Text} from "@mantine/core";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import JustificationForm from "./justification.form.tsx";
import {JustificationProps} from "./justifications.table.tsx";
import {modals} from "@mantine/modals";


function capitalizeFirstChar(string : string) : string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function JustificationsEditModal(justificationProps : JustificationProps)
    : ReactElement {

    const [unsavedData, setUnsavedData] = useState(false);
    const isMobile = useMediaQuery('(max-width: 50em)');

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
        unsavedChanges: (value: boolean) => setUnsavedData(value),
        closeModal: () =>{
        if(unsavedData) {
            modals.openConfirmModal({
                title: "You have unsaved changes",
                centered: true,
                children: (
                    <Text size={"sm"}>
                        Do you want to exit with out saving?
                    </Text>
                ),
                labels: {confirm: "Yes, discard changes", cancel: "No, go back"},
                confirmProps: {color: "red"},
                onConfirm: () => {close(); setUnsavedData(false);}
            })
        } else {
            close();
            justificationProps.onChange(); //trigger re-fetch of justifications, something may have changed
        }
    }}

    return (
        <>
            <EditButton/>
            <ModalHtml/>
        </>
    )
}