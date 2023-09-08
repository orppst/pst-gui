import {Button, Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {ObservationForm} from "./new.form.tsx";

export default function ObservationsNewModal() {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <Button onClick={open}>Create new observation</Button>
            <Modal
                opened={opened}
                onClose={close}
                centered
            >
                <ObservationForm/>
            </Modal>
        </>
    );
}