import { useContext, useState } from "react";
import {ProposalContext} from '../App2'
import {
    fetchProposalResourceCreateObservingProposal,
} from "../generated/proposalToolComponents";
import {Investigator, ObservingProposal, ProposalKind} from "../generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";
import {Box, Button, Select, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";

const kindData = [{value: "STANDARD", label: "Standard"}, {value: "TOO", label: "T.O.O"}, {value: "SURVEY", label: "Survey"}];
const defaultKind : ProposalKind = "STANDARD";



 function NewProposalPanel() {
    const { user} = useContext(ProposalContext) ;
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const form = useForm({
        initialValues: {
            title: "",
            summary: "",
            kind: defaultKind,
        },
        validate: {
            title: (value) => (value.length < 1 ? 'Title cannot be blank' : null),
            summary: (value) => (value.length < 1 ? 'Your summary cannot be blank' : null)
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
            <h3>Create Proposal</h3>
            {submitting &&
                <div>Submitting request</div>
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
