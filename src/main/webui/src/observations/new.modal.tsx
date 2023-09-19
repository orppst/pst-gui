import {ActionIcon, Modal, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {ObservationForm} from "./new.form.tsx";
import {TargetId} from "./List.tsx";
import {IconPlus} from "@tabler/icons-react";

export default function ObservationsNewModal(props: TargetId) {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <Tooltip openDelay={1000} label={"new observation"}>
                <ActionIcon color={"teal.5"} onClick={open}>
                    <IconPlus size={"2rem"}/>
                </ActionIcon>
            </Tooltip>
            <Modal
                opened={opened}
                onClose={close}
                title={"New Observation Form"}
                fullScreen
            >
                <ObservationForm id={props.id}/>
            </Modal>
        </>
    );
}