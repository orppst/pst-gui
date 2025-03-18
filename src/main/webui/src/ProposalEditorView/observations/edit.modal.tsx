import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import { Modal } from '@mantine/core';
import ObservationEditGroup from './edit.group.tsx';
import { ObservationProps } from './observationPanel.tsx';
import ViewEditButton from 'src/commonButtons/viewEdit.tsx';
import { ReactElement } from 'react';
import AddButton from 'src/commonButtons/add.tsx';

export default function ObservationEditModal(
        observationProps: ObservationProps) {

    const smallScreen = useMediaQuery("(max-width: 1350px)");

    /**
     * generates the html for a new button.
     * @return {React.ReactElement} the html for the new button.
     * @constructor
     */
    const NewButton = (): ReactElement => {
        return (
            <AddButton toolTipLabel={"new observation"}
                       onClick={open} />
        );
    }

    /**
     * generates the html for the edit button.
     * @return {React.ReactElement} the html for the edit button.
     * @constructor
     */
    const EditButton = (): ReactElement => {
        return (
            <ViewEditButton toolTipLabel={"view/edit"}
                            onClick={open} />
        );
    }

    /**
     * generates the html for the modal.
     * @return {React.ReactElement} the html for the modal.
     * @constructor
     */
    const ModalHtml = (): ReactElement => {
        return (
            <>
                <Modal
                    opened={opened}
                    onClose={props.closeModal}
                    title={newObservation ?
                        "Create an Observation" :
                        "View/Edit Observation"}
                    size ={"75%"}
                    fullScreen={smallScreen}
                    closeOnClickOutside={false}
                >
                    <ObservationEditGroup {...props}/>
                </Modal>
            </>
        )
    }

    // main code starts here.
    const [opened, {close, open}] = useDisclosure();
    const props = {...observationProps, closeModal: () => {close()}};
    let newObservation = !observationProps.observation;

    return (
        <>
            {newObservation ?
                <NewButton/> : <EditButton/>
            }
            <ModalHtml/>
        </>
    )
}