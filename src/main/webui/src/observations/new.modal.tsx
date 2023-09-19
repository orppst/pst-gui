import {ActionIcon, Modal, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {ObservationNewForm} from "./new.form.tsx";
import {IconPlus} from "@tabler/icons-react";

export default function ObservationsNewModal() {

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
                size={"50%"}
            >
                <ObservationNewForm
                    observationProps={undefined}
                    targetId={undefined}
                />
            </Modal>
        </>
    );
}