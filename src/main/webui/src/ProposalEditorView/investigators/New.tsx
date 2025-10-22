import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';
import {
    fetchPersonResourceGetPerson,
    useInvestigatorResourceAddPersonAsInvestigator,
    useInvestigatorResourceGetInvestigatorsAsObjects,
    usePersonResourceGetPersonByEmail,
} from "src/generated/proposalToolComponents";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {InvestigatorKind} from "src/generated/proposalToolSchemas.ts";
import {Checkbox, Grid, Select, Stack, TextInput} from "@mantine/core";
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
      foundInvestigator: String
    }
    const {fetcherOptions} = useProposalToolContext();

    const [investigatorEmail, setInvestigatorEmail] = useState("")

    const [investigatorName, setInvestigatorName] = useState("Not found");

    const form = useForm<newInvestigatorForm>({
        initialValues: {
            type: "COI" as InvestigatorKind,
            forPhD: false,
            foundInvestigator: "Not found",
        },
        validate: {
            type: (value) => (value != null ? null
                : 'Please select an investigator type'),
        }
    });
    const typeData = [{value: "COI", label: "CO-I"}, {value: "PI", label: "PI"}];

    const navigate = useNavigate();
    const { selectedProposalCode } = useParams();
    const queryClient = useQueryClient();
    //Get all people in the database
    const foundPeople = usePersonResourceGetPersonByEmail(
        {
            queryParams: { email: investigatorEmail },
        },
        {
            enabled: true,
        }
    );

    //Get all investigators tied to this proposal
    const currentInvestigators
        = useInvestigatorResourceGetInvestigatorsAsObjects({pathParams: {proposalCode: Number(selectedProposalCode)}});

    useEffect(() => {
        if(foundPeople.status === 'success' && currentInvestigators.status === 'success') {
            setInvestigatorName(foundPeople.data.name!);
            form.setFieldValue("foundInvestigator", foundPeople.data.name!);
            if(currentInvestigators.data.some(i => i.person?._id == foundPeople.data.dbid)) {
                console.log("Already an investigator!");
            }
        }
    },[foundPeople.status, foundPeople.data, currentInvestigators.status, currentInvestigators.data]);

    if (foundPeople.error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(foundPeople.error, null, JSON_SPACES)}</pre>
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
            {...fetcherOptions, pathParams:{id: foundPeople.data?.dbid!}})
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

                        <Grid>
                            <Grid.Col span={5}>
                        <TextInput
                                   label={'email'}
                                   value={investigatorEmail}
                                   placeholder={'Search by email address'}
                                   onChange={(e: { target: { value: string; }; }) =>
                                       setInvestigatorEmail(e.target.value)}
                        />
                            </Grid.Col>
                            <Grid.Col span={7} c={investigatorName=='Not found'?'red':'green'}>
                                <TextInput
                                    label={'Investigator name'}
                                    readOnly={true}
                                    {...form.getInputProps('foundInvestigator')} />
                            </Grid.Col>
                        </Grid>


                        <Grid >
                           <Grid.Col span={9}></Grid.Col>
                              <FormSubmitButton form={form} />
                              <CancelButton
                                 onClickEvent={handleCancel}
                                 toolTipLabel={"Go back without saving"}/>
                         </Grid>
                    </Stack>
                </form>
            </PanelFrame>
    )
}

export default AddInvestigatorPanel