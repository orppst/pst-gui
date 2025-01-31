import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchReviewerResourceGetReviewer,
    useReviewerResourceGetReviewers,
    useTACResourceAddCommitteeMember,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {TacRole} from "src/generated/proposalToolSchemas.ts";
import {Select, Stack} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "src/commonButtons/save";
import DeleteButton from "src/commonButtons/delete";
import { JSON_SPACES } from 'src/constants.tsx';
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useToken} from "../../App2.tsx";

/**
 * Renders form panel to add a reviewer to the TAC of the current cycle.
 * Does not require props
 * @return {React Element} the dynamic html for the adding new
 * Add TAC member panel.
 */
function CycleTACAddMemberPanel(): ReactElement {
    interface newMemberForm {
        role: TacRole,
        selectedMember: number
    }

    const addCommitteeMember =
        useTACResourceAddCommitteeMember();

    const authToken = useToken();

    const form = useForm<newMemberForm>({
        initialValues: {
            role: "Chair" as TacRole,
            selectedMember: 0},
        validate: {
            selectedMember: (value) => (
                value === 0 ? 'Please select a member' : null)
        }
    });
    const typeData =
        [{value: "TechnicalReviewer", label: "Technical Reviewer"},
            {value: "ScienceReviewer", label: "Science Reviewer"},
            {value: "Chair", label: "Chair"}];
    const [searchData, setSearchData] = useState([]);
    const navigate = useNavigate();
    const { selectedCycleCode } = useParams();
    const queryClient = useQueryClient();
    const { data, error, status } = useReviewerResourceGetReviewers(
        {
            queryParams: { name: '%' },
        },
        {
            enabled: true,
        }
    );

    useEffect(() => {
        if(status === 'success') {
            setSearchData([]);
            data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {
                    value: String(item.dbid), label: item.name}])
            ));
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
        //need the reviewer to add as a TAC member
        fetchReviewerResourceGetReviewer({
            pathParams:{
                reviewerId: form.values.selectedMember
            },
            headers: {authorization: `Bearer ${authToken}`}
        })
            .then((data) =>
                addCommitteeMember.mutate({
                    pathParams: {
                        cycleCode: Number(selectedCycleCode)
                    },
                    body:{
                        role: val.role,
                        member: data,
                    }
                }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries()
                            .then(() => notifySuccess("TAC member added",
                                data.person?.fullName + " added as " + val.role)
                            )
                            .then(() => navigate("../", {relative: "path"}))
                    },
                    onError: () =>
                        notifyError("TAC member NOT added", getErrorMessage(error))
                })
            )
            .catch((error)=>
                notifyError("Failed to get reviewer", getErrorMessage(error))
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
                    <Select
                        label="Select a person"
                        searchable
                        data={searchData}
                        {...form.getInputProps("selectedMember")}
                    />
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