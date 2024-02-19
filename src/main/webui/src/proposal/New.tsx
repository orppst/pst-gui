import { useContext, useState } from "react";
import {ProposalContext} from '../App2'
import {
    fetchProposalResourceAddNewField,
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, ObservingProposal, ProposalKind, TargetField} from "../generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";
import {Box, Select, Text, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import { SubmitButton } from '../commonButtons/save';
import { MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from "../constants";
import MaxCharsForInputRemaining from "../commonInputs/remainingCharacterCount.tsx";

const kindData = [
    {value: "STANDARD", label: "Standard"},
    {value: "TOO", label: "T.O.O"},
    {value: "SURVEY", label: "Survey"}];

 function NewProposalPanel() {
    const { user} = useContext(ProposalContext) ;
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const form = useForm({
        initialValues: {
            title: "",
            summary: "",
            kind: "STANDARD" as ProposalKind,
        },
        validate: {
            title: (value) => (
                value.length < 1 ? 'Title cannot be blank' : null),
            summary: (value) => (
                value.length < 1 ? 'Your summary cannot be blank' : null)
        }
    });

     const createNewObservingProposal = form.onSubmit((val) => {
        form.validate();

        setSubmitting(true);

        //Add the current user as the PI
        const investigator : Investigator = {
            "type": "PI",
            "person": user
        };

        //Add a blank field, FIXME: replace with a real field
         const field : TargetField = {
             name: "A field"
         };

        const newProposal :ObservingProposal = {
            ...val,
            "investigators": [investigator]
        };

        fetchProposalResourceCreateObservingProposal({ body: newProposal})
            .then((data) => {
                queryClient.invalidateQueries(["pst","api","proposals"])
                        .then();
                if(Number(data?._id) > 0) {
                    let newProposalId = Number(data?._id);
                    fetchProposalResourceAddNewField({
                        pathParams: {proposalCode: newProposalId},
                        body: field
                    })
                        .then(() => navigate("/proposal/" + newProposalId))
                        .catch(console.log);
                }
            })
            .then(() => setSubmitting(false))
            .catch(console.log);
    });

     return (
        <Box>
            <Text fz="lg" fw={700}>Create Proposal</Text>
            {submitting &&
                <Box>Submitting request</Box>
            }
            <form onSubmit={createNewObservingProposal}>
                <Box>
                <TextInput name="title"
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    placeholder="Give your proposal a title"
                    withAsterisk
                    label={"Title"}
                    {...form.getInputProps("title")}/>
                <MaxCharsForInputRemaining length={form.values.title.length} />
                <Textarea name="summary"
                    rows={TEXTAREA_MAX_ROWS}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    placeholder="A brief summary"
                    withAsterisk
                    label={"Summary"}
                    {...form.getInputProps("summary")} />
                <MaxCharsForInputRemaining length={form.values.summary.length} />
                <Select label={"Kind"}
                    data={kindData}
                    {...form.getInputProps("kind")}
                    />
                </Box>
                <SubmitButton label={"Create"}
                              toolTipLabel={"Create new proposal"}/>
            </form>
        </Box>
    );
}

export default NewProposalPanel
