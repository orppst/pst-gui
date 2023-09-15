import {Button, Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {ObservationForm} from "./new.form.tsx";
import {TargetId} from "./List.tsx";
import {IconPlus} from "@tabler/icons-react";

export default function ObservationsNewModal(props: TargetId) {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <Button onClick={open}>
                <IconPlus size={"1rem"}/>
            </Button>
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