import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchInvestigatorResourceAddPersonAsInvestigator,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind} from "src/generated/proposalToolSchemas.ts";
import {Checkbox, Select, Stack} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "src/commonButtons/save";
import DeleteButton from "src/commonButtons/delete";
import { JSON_SPACES } from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

/**
 * Render s form panel to add an investigator to the current proposal.
 * Does not require props
 * @return {React Element} the dynamic html for the adding new
 * investigator panel.
 */
function AddInvestigatorPanel(): ReactElement {
    interface newInvestigatorForm {
      type: InvestigatorKind,
      forPhD: boolean,
      selectedInvestigator: number
    }

    const form = useForm<newInvestigatorForm>({
        initialValues: {
            type: "COI" as InvestigatorKind,
            forPhD: false,
            selectedInvestigator: 0},
        validate: {
            type: (value) => (value != null ? null
                : 'Please select an investigator type'),
            selectedInvestigator: (value) => (
                value === 0 || value === null ? 'Please select an investigator' : null)
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
        fetchPersonResourceGetPerson(
            {pathParams:{id: form.values.selectedInvestigator}})
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
                .catch((error)=>{
                    console.log(error);
                    notifyError("Add investigator error", getErrorMessage(error));
                })
            )
            .catch((error)=> {
                console.log(error);
                notifyError("Add investigator error", getErrorMessage(error));
            })
    });

    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
    }

    return (
            <PanelFrame>
                <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Add an investigator"} />
                <form onSubmit={handleAdd}>
                    <Stack>
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
                        <FormSubmitButton
                            label={"Save"}
                            form={form}
                        />
                        <DeleteButton
                            label={"Cancel"}
                            onClickEvent={handleCancel}
                            toolTipLabel={"Do not save the new investigator"}/>
                    </Stack>
                </form>
            </PanelFrame>
    )
}

export default AddInvestigatorPanel