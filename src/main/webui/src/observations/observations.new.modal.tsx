import {modals} from "@mantine/modals";
import {Button, Group} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import NewObservationPanel from "./New.tsx";

export function ObservationsNewModal() {

    const openModel = () =>
        modals.openConfirmModal({
            modalId: 'observations-new-id',
            title: 'New observation modal',
            children: (
                <NewObservationPanel />
            ),
            labels: {confirm: 'Add', cancel: 'Cancel'},
            onCancel: () =>
                notifications.show({
                    title: 'Cancelled',
                    message: 'Observation creation cancelled',
                    color: 'gray',
                }),
            onConfirm: () =>
                notifications.show({
                    title: 'Confirmed',
                    message: 'Observation creation confirmed',
                    color: 'teal'
                })

        });

    return (
        <Group position={"left"}>
            <Button onClick={openModel}>Create new observation</Button>
        </Group>
    );
}