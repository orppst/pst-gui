import {ReactElement} from "react";
import AddButton from "../../commonButtons/add.tsx";
import ViewEditButton from "../../commonButtons/viewEdit.tsx";
import {Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import AllocatedBlockForm, {AllocatedBlockFormProps} from "./allocatedBlock.form.tsx";

export default
function AllocatedBlockModal(inputProps: AllocatedBlockFormProps) : ReactElement {

    const [opened, {close, open}] = useDisclosure();
    let newAllocatedBlock = !inputProps.allocatedBlock;
    const outputProps = {...inputProps, closeModal: () => {close()}};

    const NewButton = (): ReactElement => {
        return (
            <AddButton
                toolTipLabel={"add an allocation block"}
                onClick={open}
            />
        );
    }

    const EditButton = (): ReactElement => {
        return (
            <ViewEditButton
                toolTipLabel={"edit allocation resource amount"}
                onClick={open}
            />
        );
    }

    const ModalContent = (): ReactElement => {
        return (
            <Modal
                opened={opened}
                onClose={outputProps.closeModal}
                title={newAllocatedBlock ?
                    "New Allocated Block for '" + inputProps.proposalTitle + "'":
                    "Edit Allocated Block for '" + inputProps.proposalTitle + "'"}
                size={"50%"}
            >
                <AllocatedBlockForm {...outputProps} />
            </Modal>
        )
    }

    return (
        <>
            {newAllocatedBlock ?
                <NewButton/> : <EditButton/>
            }
            <ModalContent/>
        </>
    )
}