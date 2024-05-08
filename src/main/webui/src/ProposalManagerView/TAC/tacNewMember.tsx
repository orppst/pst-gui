import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchReviewerResourceGetReviewer, fetchTACResourceAddCommitteeMember,
    useReviewerResourceGetReviewers,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {TacRole} from "src/generated/proposalToolSchemas.ts";
import {Grid, Select} from "@mantine/core";
import {useForm} from "@mantine/form";
import {SubmitButton} from "src/commonButtons/save";
import DeleteButton from "src/commonButtons/delete";
import { JSON_SPACES } from 'src/constants.tsx';
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

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

    const handleAdd = form.onSubmit((val) => {
        //Get full investigator from API and add back to proposal
        fetchReviewerResourceGetReviewer(
            {pathParams:{reviewerId: form.values.selectedMember}})
            .then((data) => fetchTACResourceAddCommitteeMember(
                {pathParams:{cycleCode: Number(selectedCycleCode)},
                    body:{
                        role: val.role,
                        member: data,
                    }})
                .then(()=> {
                    return queryClient.invalidateQueries({
                        predicate: (query) => {
                            return query.queryKey.length === 5
                                && query.queryKey[4] === 'TAC';
                        }
                    });
                })
                .then(()=>navigate(  "../", {relative:"path"})) // see https://stackoverflow.com/questions/72537159/react-router-v6-and-relative-links-from-page-within-route
                .catch((error)=> {
                    console.log(error);
                    notifyError("Add failed", getErrorMessage(error));
                })
            )
            .catch((error)=> {
                console.log(error);
                notifyError("Add failed", getErrorMessage(error));
            });
    });

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Add a reviewer"} />
            <form onSubmit={handleAdd}>
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
                <Grid>
                    <Grid.Col span={2}>
                        <SubmitButton
                            label={"Add"}
                            toolTipLabel={"Add new committee member"}/>
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <DeleteButton
                            label={"Cancel"}
                            onClickEvent={handleCancel}
                            toolTipLabel={"Do not save the new committee member"}/>
                    </Grid.Col>
                </Grid>
            </form>
        </PanelFrame>
    )
}

export default CycleTACAddMemberPanel