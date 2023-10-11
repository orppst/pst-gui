import {useDisclosure} from "@mantine/hooks";
import {Modal} from "@mantine/core";
import TechnicalGoalEditGroup from "./edit.group.tsx";
import {TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import ViewEditButton from "../commonButtons/viewEdit.tsx";

export default function TechnicalGoalEditModal(goal: TechnicalGoal) {

    const [opened, { close, open }] = useDisclosure();

    return (
        <>
            <ViewEditButton toolTipLabel={"view/edit"} onClick={open} />
            <Modal
                opened={opened}
                onClose={close}
                title={"View/Edit Technical Goal No." + goal._id}
                fullScreen
                withCloseButton={false}
            >
                <TechnicalGoalEditGroup goal={goal} close={close} />
            </Modal>
        </>
    );

}