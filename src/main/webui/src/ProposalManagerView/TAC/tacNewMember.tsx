import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    usePersonResourceGetPersonByEmail,
    useTACResourceAddCommitteeMember,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {TacRole} from "src/generated/proposalToolSchemas.ts";
import {Grid, Group, Select, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "src/commonButtons/save";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import CancelButton from "../../commonButtons/cancel.tsx";

/**
 * Renders form panel to add a reviewer to the TAC of the current cycle.
 * Does not require props
 * @return {React Element} the dynamic html for the adding new
 * Add TAC member panel.
 */
function CycleTACAddMemberPanel(): ReactElement {
    interface newMemberForm {
        role: TacRole,
        selectedMember: String
    }

    const addCommitteeMember =
        useTACResourceAddCommitteeMember();

    const form = useForm<newMemberForm>({
        initialValues: {
            role: "Chair" as TacRole,
            selectedMember: 'Not found'},
        validate: {
            selectedMember: (value) => (
                value == 'Not found' ? 'Please select a member' : null)
        }
    });
    const typeData =
        [
            {value: "TechnicalReviewer", label: "Technical Reviewer"},
            {value: "ScienceReviewer", label: "Science Reviewer"},
            {value: "Chair", label: "Chair"}
        ];
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
            form.setFieldValue("selectedMember", thePerson.data.name)
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

    const handleAdd = form.onSubmit((val) => {
        addCommitteeMember.mutate({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                tacRole: val.role
            },
            body: {_id: thePerson.data?.dbid!},
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries()
                    .then(() => notifySuccess("TAC member added",
                        thePerson.data?.name + " added as " + val.role)
                    )
                    .then(() => navigate("../", {relative: "path"}))
            },
            onError: (error) =>
                notifyError("Failed to add " + thePerson.data?.name + " as a TAC member",
                    getErrorMessage(error))
        })
    });

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Add a TAC Member"} />
            <form onSubmit={handleAdd}>
                <Stack>
                    <Select label={"Role"}
                            data={typeData}
                            {...form.getInputProps("role")}
                    />
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
                                {...form.getInputProps("selectedMember")}
                            />
                        </Grid.Col>
                    </Grid>
                    <Group justify={'flex-end'}>
                        <FormSubmitButton
                            label={"Add"}
                            form={form}
                        />
                        <CancelButton
                            label={"Cancel"}
                            onClickEvent={handleCancel}
                            toolTipLabel={"Go back to the TAC list"}
                        />
                    </Group>
                </Stack>
            </form>
        </PanelFrame>
    )
}

export default CycleTACAddMemberPanel