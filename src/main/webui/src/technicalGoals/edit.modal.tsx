import {useDisclosure} from "@mantine/hooks";
import {Modal} from "@mantine/core";
import ViewEditButton from "../commonButtons/viewEdit.tsx";
import {ReactElement} from "react";
import {TechnicalGoalProps} from "./technicalGoalsPanel.tsx";
import AddButton from "../commonButtons/add.tsx";
import TechnicalGoalEditGroup from "./edit.group.tsx";


export default function TechnicalGoalEditModal(technicalGoalProps: TechnicalGoalProps) {

    const NewButton = (): ReactElement => {
        return (
            <AddButton toolTipLabel={"new technical goal"}
                       onClick={open} />
        );
    }

    const EditButton = (): ReactElement => {
        return (
            <ViewEditButton toolTipLabel={"view/edit"}
                            onClick={open} />
        );
    }

    const ModalHtml = () : ReactElement => {
        return (
            <Modal
                opened={opened}
                onClose={props.closeModal}
                title={newTechnicalGoal ?
                    "New Technical Goal" :
                    "View/Edit Technical Goal No." + technicalGoalProps.technicalGoal?._id}
                fullScreen
            >
                <TechnicalGoalEditGroup {...props} />
            </Modal>
        )
    }

    const [opened, { close, open }] = useDisclosure();

    const props = {...technicalGoalProps, closeModal: () => {close()}}

    let newTechnicalGoal = !technicalGoalProps.technicalGoal

    return (
            <>
                {newTechnicalGoal ?
                    <NewButton/> : <EditButton/>
                }
                <ModalHtml/>
            </>
    );
}