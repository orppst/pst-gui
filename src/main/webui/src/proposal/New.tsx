import { useContext, useEffect, useState } from 'react';
import {ProposalContext} from '../App2'
import {
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, ObservingProposal, ProposalKind} from "../generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";
import {Box, Button, Select, Text, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";

const kindData = [{value: "STANDARD", label: "Standard"}, {value: "TOO", label: "T.O.O"}, {value: "SURVEY", label: "Survey"}];

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
            title: (value) => (value.length < 1 ? 'Title cannot be blank' : null),
            summary: (value) => (value.length < 1 ? 'Your summary cannot be blank' : null)
        }
    });

    /**
     * force the validation to engage once the UI has been rendered.
     */
    useEffect(() => {
        form.errors = form.validate().errors;
    })

    const createNewObservingProposal = form.onSubmit((val) => {
        form.validate();

        setSubmitting(true);

        //Add the current user as the PI
        const investigator : Investigator = {
            "type": "PI",
            "person": user
        };

        const newProposal :ObservingProposal = {
            ...val,
            "investigators": [investigator]
        };

        fetchProposalResourceCreateObservingProposal({ body: newProposal})
            .then((data) => {
                queryClient.invalidateQueries(["pst","api","proposals"])
                        .then(() => setSubmitting(false));
                navigate("/proposal/" + data?._id);
            })
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
                <TextInput name="title" placeholder="Give your proposal a title" withAsterisk label={"Title"} {...form.getInputProps("title")}/>
                <Textarea rows={3} name="summary" placeholder="A brief summary" withAsterisk label={"Summary"} {...form.getInputProps("summary")} />
                <Select label={"Kind"}
                    data={kindData}
                    {...form.getInputProps("kind")}
                    />
                </Box>
                <Button type="submit">Create</Button>
            </form>
        </Box>
    );
}

export default NewProposalPanel
