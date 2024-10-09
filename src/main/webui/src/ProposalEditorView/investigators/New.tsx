import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchInvestigatorResourceAddPersonAsInvestigator, fetchInvestigatorResourceGetInvestigators,
    fetchPersonResourceGetPerson,
    usePersonResourceGetPeople,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind, ObjectIdentifier} from "src/generated/proposalToolSchemas.ts";
import {Checkbox, ComboboxData, Grid, Select, Stack} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "src/commonButtons/save";
import CancelButton from "src/commonButtons/cancel.tsx";
import { JSON_SPACES } from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";

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
    const [searchData, setSearchData] = useState<ComboboxData>([]);
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
            let currentInvestigators: ObjectIdentifier[] = [];

            //Get current investigators from search data
            fetchInvestigatorResourceGetInvestigators(
                {pathParams: {proposalCode: Number(selectedProposalCode)}})
                .then(r => {
                    r.map((i) => currentInvestigators.push(i))

                    setSearchData([]);
                    data?.map((item) => {
                        if(!currentInvestigators.some(e => e.name === item.name))
                            setSearchData((current) => [...current, {
                                value: String(item.dbid), label: item.name}] as ComboboxData)
                        })
                }
            )
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
                    <ContextualHelpButton  messageId="MaintInvestAdd" />
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
                    </Stack>
                    <p> </p>
                    <Grid >
                       <Grid.Col span={9}></Grid.Col>
                          <FormSubmitButton form={form} />
                          <CancelButton
                             onClickEvent={handleCancel}
                             toolTipLabel={"Go back without saving"}/>
                     </Grid>
                     <p> </p>
                </form>
            </PanelFrame>
    )
}

export default AddInvestigatorPanel