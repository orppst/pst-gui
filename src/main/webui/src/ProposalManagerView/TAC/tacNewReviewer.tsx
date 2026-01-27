import {ReactElement, SyntheticEvent, useEffect, useState} from "react";
import {
    usePersonResourceGetPersonByEmail,
    useReviewerResourceAddReviewer
} from "../../generated/proposalToolComponents.ts";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {Grid, Group, Stack, TextInput} from "@mantine/core";
import AddButton from "../../commonButtons/add.tsx";
import CancelButton from "../../commonButtons/cancel.tsx";

export default
function CycleTACAddReviewerPanel() : ReactElement {

    const addReviewer = useReviewerResourceAddReviewer();

    const [foundPerson, setFoundPerson] = useState("Not found");
    const [personEmail, setPersonEmail] = useState("");
    const navigate = useNavigate();
    const { selectedCycleCode } = useParams();
    const queryClient = useQueryClient();
    const thePerson = usePersonResourceGetPersonByEmail(
        {queryParams: { email: personEmail }},
        {enabled: true}
    );

    useEffect(() => {
        if(thePerson.status === 'success' && thePerson.data?.name != null) {
            setFoundPerson(thePerson.data.name)
        }
    },[thePerson.status,thePerson.data]);

    if (thePerson.error) {
        return (
            <PanelFrame>
                <AlertErrorMessage
                    title={"Failed to get the Person"}
                    error={getErrorMessage(thePerson.error)}
                />
            </PanelFrame>
        );
    }

    const handleAdd = () => {
        addReviewer.mutate({
            body: {_id: thePerson.data?.dbid!},
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() => notifySuccess("Reviewer added",
                        thePerson.data?.name + " added as a reviewer.")
                    )
                    .then(() => navigate("../", {relative: "path"}))
            },
            onError: (error) =>
                notifyError("Failed to add " + thePerson.data?.name + " as a TAC member",
                    getErrorMessage(error))
        })
    }

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Add a Reviewer"} />
            <Stack>
                <Grid>
                    <Grid.Col span={5}>
                        <TextInput
                            label={'email'}
                            value={personEmail}
                            placeholder={'Search by email address'}
                            onChange={(e: { target: { value: string; }; }) =>
                                setPersonEmail(e.target.value)}
                        />
                    </Grid.Col>
                    <Grid.Col span={7} c={foundPerson=='Not found'?'red':'green'}>
                        <TextInput
                            label="Name"
                            readOnly={true}
                            value={foundPerson}
                        />
                    </Grid.Col>
                </Grid>
                <Group justify={'flex-end'}>
                    <AddButton
                        toolTipLabel={foundPerson.length === 0 || foundPerson == 'Not found' ?
                            "Search by email address to find a registered person":
                            "Add the chosen person as a reviewer"}
                        disabled={foundPerson.length === 0 || foundPerson == 'Not found'}
                        onClick={handleAdd}
                    />
                    <CancelButton
                        label={"Cancel"}
                        onClickEvent={handleCancel}
                        toolTipLabel={"Go back to the TAC and reviewer lists"}
                    />
                </Group>
            </Stack>
        </PanelFrame>
    )
}