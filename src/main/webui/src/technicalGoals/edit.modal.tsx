import {useDisclosure} from "@mantine/hooks";
import {Modal} from "@mantine/core";
import ViewEditButton from "../commonButtons/viewEdit.tsx";
import {ReactElement} from "react";
import {TechnicalGoalProps} from "./technicalGoalsPanel.tsx";
import AddButton from "../commonButtons/add.tsx";
import TechnicalGoalEditGroup from "./edit.group.tsx";

/**
 * generates the modal for the edit panel.
 *
 * @param {TechnicalGoalProps} technicalGoalProps the data.
 * @return {React.ReactElement} the dynamic html for the panel.
 * @constructor
 */
export default function TechnicalGoalEditModal(
        technicalGoalProps: TechnicalGoalProps): ReactElement {
    /**
     * creates an add button under the new label.
     *
     * @return {React.ReactElement}: the dynamic html for the add button.
     * @constructor
     */
    const NewButton = (): ReactElement => {
        return (
            <AddButton toolTipLabel={"new technical goal"}
                       onClick={open} />
        );
    }

    /**
     * creates an edit button.
     *
     * @return {React.ReactElement} the dynamic html for the edit button.
     * @constructor
     */
    const EditButton = (): ReactElement => {
        return (
            <ViewEditButton toolTipLabel={"view/edit"}
                            onClick={open} />
        );
    }

    /**
     * creates the modals dynamic html.
     *
     * @return {React.ReactElement} the modals dynamic html.
     * @constructor
     */
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