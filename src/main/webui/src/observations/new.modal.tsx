import {Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import TargetTypeForm from "./targetType.form.tsx";
import AddButton from "../commonButtons/add.tsx";

export default function ObservationsNewModal() {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <AddButton toolTipLabel={"new observation"} onClick={open} />
            <Modal
                opened={opened}
                onClose={close}
                title={"New Observation Form"}
                size={"50%"}
            >
                <TargetTypeForm
                    observation={undefined}
                    newObservation={true}
                    closeModal={() => {close();}}
                />
            </Modal>
        </>
    );
}