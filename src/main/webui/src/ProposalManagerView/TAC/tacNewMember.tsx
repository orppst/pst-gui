import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchPersonResourceGetPerson, fetchTACResourceAddCommitteeMember,
    usePersonResourceGetPeople,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {TacRole} from "src/generated/proposalToolSchemas.ts";
import {Box, Grid, Select} from "@mantine/core";
import {useForm} from "@mantine/form";
import {SubmitButton} from "src/commonButtons/save";
import DeleteButton from "src/commonButtons/delete";
import { JSON_SPACES } from 'src/constants.tsx';

/**
 * Render s form panel to add an investigator to the current proposal.
 * Does not require props
 * @return {React Element} the dynamic html for the adding new
 * investigator panel.
 */
function CycleTACAddMemberPanel(): ReactElement {
    interface newMemberForm {
        type: TacRole,
        selectedMember: number
    }

    const form = useForm<newMemberForm>({
        initialValues: {
            type: "Chair" as TacRole,
            selectedMember: 0},
        validate: {
            selectedMember: (value) => (
                value === 0 ? 'Please select a member' : null)
        }
    });
    const typeData = [{value: "TechnicalReviewer", label: "Technical Reviewer"}, {value: "ScienceReviewer", label: "Science Reviewer"}, {value: "Chair", label: "Chair"}];
    const [searchData, setSearchData] = useState([]);
    const navigate = useNavigate();
    const { selectedCycleCode } = useParams();
    const queryClient = useQueryClient();
    const { data, error, status } = usePersonResourceGetPeople(
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
            <div>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </div>
        );
    }

    const handleAdd = form.onSubmit((val) => {
        //Get full investigator from API and add back to proposal
        fetchPersonResourceGetPerson(
            {pathParams:{id: form.values.selectedMember}})
            .then((data) => fetchTACResourceAddCommitteeMember(
                {pathParams:{cycleCode: Number(selectedCycleCode)},
                    body:{
                        role: val.type,
                        member: {person: data},
                    }})
                .then(()=> {
                    return queryClient.invalidateQueries();
                })
                .then(()=>navigate(  "../", {relative:"path"})) // see https://stackoverflow.com/questions/72537159/react-router-v6-and-relative-links-from-page-within-route
                .catch(console.log)
            )
            .catch(console.log);
    });

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
        <Box>
            <h3>Add an investigator</h3>
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
                    <Grid.Col span={1}>
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
        </Box>
    )
}

export default CycleTACAddMemberPanel