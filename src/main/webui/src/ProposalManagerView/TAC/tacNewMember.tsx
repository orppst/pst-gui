import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchReviewerResourceAddReviewer,
    fetchReviewerResourceGetReviewer, usePersonResourceGetPersonByEmail, useReviewerResourceAddReviewer,
    useReviewerResourceGetReviewers,
    useTACResourceAddCommitteeMember,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {Person, Reviewer, TacRole} from "src/generated/proposalToolSchemas.ts";
import {Grid, Select, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "src/commonButtons/save";
import DeleteButton from "src/commonButtons/delete";
import { JSON_SPACES } from 'src/constants.tsx';
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useToken} from "../../App2.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

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

    const {fetcherOptions} = useProposalToolContext();

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
        [{value: "TechnicalReviewer", label: "Technical Reviewer"},
            {value: "ScienceReviewer", label: "Science Reviewer"},
            {value: "Chair", label: "Chair"}];
    const [foundPerson, setFoundPerson] = useState("Not found");
    const [personEmail, setPersonEmail] = useState("");
    const navigate = useNavigate();
    const { selectedCycleCode } = useParams();
    const queryClient = useQueryClient();
    const { data, error, status } = usePersonResourceGetPersonByEmail(
        {
            queryParams: { email: personEmail },
        },
        {
            enabled: true,
        }
    );

    useEffect(() => {
        if(status === 'success' && data?.name != null) {
            setFoundPerson(data.name)
            form.setFieldValue("selectedMember", data.name)
        }
    },[status,data]);

    if (error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    /*
        We must use the 'fetch-get' here as the reviewerId comes from selectable user input.
        Could this be redesigned to avoid this?
     */
    const handleAdd = form.onSubmit((val) => {
        //Are they already a reviewer?
        //Try adding them
        const reviewerToAdd: Reviewer = {
            person: {
                _id: data?.dbid,
                fullName: data?.name
            }
        }
        fetchReviewerResourceAddReviewer({
            body: reviewerToAdd,
            ...fetcherOptions
        }).then((newReviewer) =>
                addCommitteeMember.mutate({
                    pathParams: {
                        cycleCode: Number(selectedCycleCode)
                    },
                    body:{
                        role: val.role,
                        member: newReviewer,
                    }
                }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries()
                            .then(() => notifySuccess("TAC member added",
                                newReviewer.person?.fullName + " added as " + val.role)
                            )
                            .then(() => navigate("../", {relative: "path"}))
                    },
                    onError: () =>
                        notifyError("TAC member NOT added", getErrorMessage(error))
                })
            )
            .catch((error)=>
                notifyError("Failed to add reviewer", getErrorMessage(error))
            );
    });

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Add a reviewer"} />
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
                    <FormSubmitButton
                        label={"Add"}
                        form={form}
                    />
                    <DeleteButton
                        label={"Cancel"}
                        onClickEvent={handleCancel}
                        toolTipLabel={"Do not save the new committee member"}
                    />
                </Stack>
            </form>
        </PanelFrame>
    )
}

export default CycleTACAddMemberPanel