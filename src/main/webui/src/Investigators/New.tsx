import {SyntheticEvent, useEffect, useState} from "react";
import {
    fetchInvestigatorResourceAddPersonAsInvestigator,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "../generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind} from "../generated/proposalToolSchemas.ts";
import {Box, Button, Checkbox, Grid, Select} from "@mantine/core";
import {useForm} from "@mantine/form";

function AddInvestigatorPanel() {
    interface newInvestigatorForm {
      type: InvestigatorKind,
      forPhD: boolean,
      selectedInvestigator: number
    }

    const form = useForm<newInvestigatorForm>({
        initialValues: {type: "COI" as InvestigatorKind, forPhD: false, selectedInvestigator: 0},
        validate: {
            selectedInvestigator: (value) => (value === 0 ? 'Please select an investigator' : null)
        }
    });
    const typeData = [{value: "COI", label: "CO-I"}, {value: "PI", label: "PI"}];
    const [searchData, setSearchData] = useState([]);
    const navigate = useNavigate();
    const { selectedProposalCode } = useParams();
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
        form.errors = form.validate().errors;
        if(status === 'success') {
            setSearchData([]);
            data?.map((item) => (
                // @ts-ignore
                setSearchData((current) => [...current, {value: String(item.dbid), label: item.name}])
            ));
        }
    },[status,data]);

    if (error) {
        return (
            <div>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    const handleAdd = form.onSubmit((val) => {
        //Get full investigator from API and add back to proposal
        fetchPersonResourceGetPerson({pathParams:{id: form.values.selectedInvestigator}})
            .then((data) => fetchInvestigatorResourceAddPersonAsInvestigator(
                {pathParams:{proposalCode: Number(selectedProposalCode)},
                    body:{
                        type: val.type,
                        forPhD: val.forPhD,
                        person: data,
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
                    <Select label={"Type"}
                        data={typeData}
                        {...form.getInputProps("type")}
                    />
                    <Checkbox
                        label={"Is this for a PHD?"}
                        {...form.getInputProps("forPhD")}
                    />
                    <Select
                        label="Select an investigator"
                        searchable
                        data={searchData}
                        {...form.getInputProps("selectedInvestigator")}
                    />
                    <Grid>
                        <Grid.Col span={12}><Button type={"submit"}>Add</Button></Grid.Col>
                        <Grid.Col span={1}><Button variant="light" onClick={handleCancel}>Cancel</Button></Grid.Col>
                    </Grid>
                </form>
            </Box>
    )
}

export default AddInvestigatorPanel