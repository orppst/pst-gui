import { useDisclosure } from '@mantine/hooks';
import { Modal } from '@mantine/core';
import ObservationEditGroup from './edit.group.tsx';
import { ObservationProps } from './observationPanel.tsx';
import ViewEditButton from '../commonButtons/viewEdit.tsx';
import { ReactElement } from 'react';
import AddButton from '../commonButtons/add.tsx';

export default function ObservationEditModal(observationProps: ObservationProps) {
    const [opened, {close, open}] = useDisclosure();

    const props = {...observationProps, closeModal: () => {close()}};

    const NewButton = (): ReactElement => {
        return (
            <AddButton toolTipLabel={"new observation"}
                       onClick={open} />
        );
    }

    const EditButton = (): ReactElement => {
        return (
            <ViewEditButton toolTipLabel={"view/edit"}
                            onClick={open} />
        );
    }

    const ModalHtml = (): ReactElement => {
        return (
            <>
                <Modal
                    opened={opened}
                    onClose={props.closeModal}
                    title={"View/Edit Observation Form"}
                    fullScreen
                >
                    <ObservationEditGroup {...props}/>
                </Modal>
            </>
        )
    }

    if (props.newObservation) {
        return (
            <>
                <NewButton/>
                <ModalHtml/>
            </>
        );
    }
    return (
        <>
            <EditButton/>
            <ModalHtml/>
        </>
    )
}