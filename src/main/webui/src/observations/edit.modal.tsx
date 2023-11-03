import {useDisclosure} from "@mantine/hooks";
import {Modal} from "@mantine/core";
import ObservationEditGroup from "./edit.group.tsx";
import {ObservationProps} from "./observationPanel.tsx";
import ViewEditButton from "../commonButtons/viewEdit.tsx";

export default function ObservationEditModal(observationProps: ObservationProps) {
    const [opened, {close, open}] = useDisclosure();

    const props = {...observationProps, closeModal: () => {close()}};

    return (
        <>
            <ViewEditButton toolTipLabel={"view/edit"} onClick={open} />
            <Modal
                opened={opened}
                onClose={close}
                title={"View/Edit Observation Form"}
                fullScreen
            >
                <ObservationEditGroup {...props}/>
            </Modal>
        </>
    )
}