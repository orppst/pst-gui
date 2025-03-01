import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchPersonResourceGetPerson,
    useInvestigatorResourceAddPersonAsInvestigator,
    useInvestigatorResourceGetInvestigatorsAsObjects,
    usePersonResourceGetPeople,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind} from "src/generated/proposalToolSchemas.ts";
import {Checkbox, ComboboxData, Grid, Select, Stack} from "@mantine/core";
import {useForm} from "@mantine/form";
import {FormSubmitButton} from "src/commonButtons/save";
import CancelButton from "src/commonButtons/cancel.tsx";
import { JSON_SPACES } from 'src/constants.tsx';
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

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
    const {fetcherOptions} = useProposalToolContext();


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
    //Get all people in the database
    const allPeople = usePersonResourceGetPeople(
        {
            queryParams: { name: '%' },
        },
        {
            enabled: true,
        }
    );

    //Get all investigators tied to this proposal
    const currentInvestigators
        = useInvestigatorResourceGetInvestigatorsAsObjects({pathParams: {proposalCode: Number(selectedProposalCode)}});
/*
    //Get details of the currently selected person
    let selectedPerson = usePersonResourceGetPerson(
        {pathParams:{id: form.values.selectedInvestigator}})
*/
    useEffect(() => {
        if(allPeople.status === 'success' && currentInvestigators.status === 'success') {
            setSearchData([]);
            allPeople.data?.map((item) => {
                if(!currentInvestigators.data.some(i => i.person?._id == item.dbid))
                    setSearchData((current) => [...current, {
                        value: String(item.dbid), label: item.name}] as ComboboxData)
            })
        }
    },[allPeople.status, allPeople.data, currentInvestigators.status, currentInvestigators.data]);

    if (allPeople.error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(allPeople.error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    if(currentInvestigators.error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(currentInvestigators.error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const addInvestigatorMutation = useInvestigatorResourceAddPersonAsInvestigator({
        onSuccess: () => {
            queryClient.invalidateQueries().finally(() =>
                navigate("../", {relative:"path"}));
        },
        onError: (error) => notifyError("Add investigator error", getErrorMessage(error))

    });

    const handleAdd = form.onSubmit((val) => {
        fetchPersonResourceGetPerson(
            {...fetcherOptions, pathParams:{id: val.selectedInvestigator}})
            .then((selectedPerson) => {
                if (selectedPerson != undefined) {
                    addInvestigatorMutation.mutate(
                        {
                            pathParams: {proposalCode: Number(selectedProposalCode)},
                            body: {
                                type: val.type,
                                forPhD: val.forPhD,
                                person: selectedPerson,
                            }
                        })
                } else {
                    notifyError("Add investigator error", "Selected person is empty??");
                }
            })
            .catch((error) => notifyError("Add investigator error", getErrorMessage(error)))
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