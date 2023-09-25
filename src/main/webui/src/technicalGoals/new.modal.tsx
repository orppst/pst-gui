import {useDisclosure} from "@mantine/hooks";
import {ActionIcon, Modal, Tooltip} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";
import TechnicalGoalParentForm from "./parent.form.tsx";

export default function TechnicalGoalNewModal() {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <Tooltip openDelay={1000} label={"new technical goal"}>
                <ActionIcon color={"teal.5"} onClick={open}>
                    <IconPlus size={"2rem"}/>
                </ActionIcon>
            </Tooltip>
            <Modal
                opened={opened}
                onClose={close}
                title={"New Technical Goal Form"}
                size={"30%"}
            >
                <TechnicalGoalParentForm goal={undefined} close={close}/>
            </Modal>
        </>
    );
}