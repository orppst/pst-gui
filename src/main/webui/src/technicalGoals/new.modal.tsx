import {useDisclosure} from "@mantine/hooks";
import {Modal} from "@mantine/core";
import AddButton from "../commonButtons/add.tsx";
import PerformanceParametersForm from "./performance.form.tsx";

export default function TechnicalGoalNewModal() {

    const [opened, { close, open }] = useDisclosure();
    return (
        <>
            <AddButton toolTipLabel={"new technical goal"} onClick={open} />
            <Modal
                opened={opened}
                onClose={close}
                title={"New Technical Goal Form"}
                size={"30%"}
            >
                <PerformanceParametersForm newTechnicalGoal={true} closeModal={close} />
            </Modal>
        </>
    );
}