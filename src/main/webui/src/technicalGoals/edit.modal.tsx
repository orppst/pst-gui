import {useDisclosure} from "@mantine/hooks";
import {ActionIcon, Modal, Tooltip} from "@mantine/core";
import {IconEyeEdit} from "@tabler/icons-react";
import TechnicalGoalParentForm from "./parent.form.tsx";
import {TechnicalGoal} from "../generated/proposalToolSchemas.ts";

export default function TechnicalGoalEditModal(goal: TechnicalGoal) {

    const [opened, { close, open }] = useDisclosure();

    return (
        <>
            <Tooltip openDelay={1000} label={"view/edit"}>
                <ActionIcon color={"green"} onClick={open}>
                    <IconEyeEdit size={"2rem"}/>
                </ActionIcon>
            </Tooltip>
            <Modal
                opened={opened}
                onClose={close}
                title={"View/Edit Technical Goal No." + goal._id}
                fullScreen
            >
                <TechnicalGoalParentForm goal={goal} close={close} />
            </Modal>
        </>
    );

}