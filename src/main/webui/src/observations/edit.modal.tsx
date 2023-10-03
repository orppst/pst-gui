import {useDisclosure} from "@mantine/hooks";
import {ActionIcon, Modal, Tooltip} from "@mantine/core";
import {IconEyeEdit} from "@tabler/icons-react";
import ObservationEditForm from "./edit.form.tsx";
import {ObservationTargetProps} from "./List.tsx";

export default function ObservationEditModal(observationProps: ObservationTargetProps) {
    const [opened, {close, open}] = useDisclosure();

    const props = {...observationProps, closeModal: () => {close()}};

    return (
        <>
            <Tooltip openDelay={1000} label={"view/edit"}>
                <ActionIcon color={"green"} onClick={open} variant={"subtle"}>
                    <IconEyeEdit size={"2rem"}/>
                </ActionIcon>
            </Tooltip>
            <Modal
                opened={opened}
                onClose={close}
                title={"View/Edit Observation Form"}
                size={"75%"}
            >
                <ObservationEditForm {...props}/>
            </Modal>
        </>
    )
}