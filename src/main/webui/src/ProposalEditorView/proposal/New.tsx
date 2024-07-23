import { useContext, useState } from "react";
import {ProposalContext} from 'src/App2'
import {
    fetchProposalResourceAddNewField,
    fetchProposalResourceCreateObservingProposal,
} from "src/generated/proposalToolComponents";
import {
    Investigator,
    Justification,
    ObservingProposal,
    ProposalKind,
    TargetField
} from "src/generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";
import {Box, Container, Select, Text, Textarea, TextInput, Stack, Space} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import {FormSubmitButton} from 'src/commonButtons/save';
import { MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from "src/constants";
import MaxCharsForInputRemaining from "src/commonInputs/remainingCharacterCount.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "/src/commonButtons/contextualHelp.tsx"


const kindData = [
    {value: "Standard", label: "Standard"},
    {value: "ToO", label: "T.O.O"},
    {value: "Survey", label: "Survey"}
];

const textFormatData = [
    {value: 'latex', label: 'Latex'},
    {value: 'rst', label: 'RST'},
    {value: 'asciidoc', label: 'ASCIIDOC'}
]

 function NewProposalPanel() {
    const { user} = useContext(ProposalContext) ;
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const emptyJustification : Justification = {text: "", format: "asciidoc"};
    const form = useForm({
        initialValues: {
            title: "",
            summary: "",
            kind: "Standard" as ProposalKind,
            scientificJustification: emptyJustification,
            technicalJustification: emptyJustification
        },
        validate: {
            title: (value) => (
                value.length < 1 ? 'Title cannot be blank' : null),
            summary: (value) => (
                value.length < 1 ? 'Your summary cannot be blank' : null)
        }
    });

     const createNewObservingProposal = form.onSubmit((val) => {

        setSubmitting(true);

        //Add the current user as the PI
        const investigator : Investigator = {
            "type": "PI",
            "person": user
        };

        //Add a blank field, FIXME: replace with a real field
         const field : TargetField = {
             "@type": 'proposal:TargetField',
             name: "Default Field"
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
                        .catch(error => notifyError("Error creating field",
                            "cause: " + getErrorMessage(error))
                        );
                }
            })
            .then(() => setSubmitting(false))
            .catch((error) => {
                console.log(error);
                notifyError("Create proposal error", getErrorMessage(error))
            });
    });

const helpButtonCall = (
    <ContextualHelpButton
    messageId="CreaProp"
    />
    );

     return (
        <PanelFrame>
            <PanelHeader itemName={"NEW"} panelHeading={"Create Proposal"} />
            {submitting &&
                <Box>Submitting request</Box>
            }
            <form onSubmit={createNewObservingProposal}>
                <Container fluid>
                {helpButtonCall}
                <Stack>
                    <TextInput name="title"
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        placeholder="Give your proposal a title"
                        withAsterisk
                        label={"Title"}
                        {...form.getInputProps("title")}
                    />
                    <MaxCharsForInputRemaining
                        length={form.values.title.length}
                    />
                    <Textarea name="summary"
                        rows={TEXTAREA_MAX_ROWS}
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        placeholder="A brief summary"
                        withAsterisk
                        label={"Summary"}
                        {...form.getInputProps("summary")}
                    />
                    <MaxCharsForInputRemaining
                        length={form.values.summary.length}
                    />
                    <FormSubmitButton
                         form={form}
                     />
                    <Space />

                    <Select label={"Kind"}
                        data={kindData}
                        {...form.getInputProps("kind")}
                    />
                    <Text size={"sm"} c={"cyan"} my={"md"}>
                        Justifications are optional here, the text format defaults to "ASCIIDOC"
                    </Text>
                    <Textarea
                        rows={TEXTAREA_MAX_ROWS}
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        placeholder={"Scientific Justification"}
                        label={"Scientific Justification"}
                        {...form.getInputProps('scientificJustification.text')}
                    />
                    <MaxCharsForInputRemaining
                        length={form.values.scientificJustification.text?.length!}
                    />
                    <Select
                        label={"Scientific Justification text format"}
                        placeholder={"pick one"}
                        data={textFormatData}
                        pt={"sm"} pb={"lg"}
                        {...form.getInputProps('scientificJustification.format')}
                    />
                    <Textarea
                        rows={TEXTAREA_MAX_ROWS}
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        placeholder={"Technical Justification"}
                        label={"Technical Justification"}
                        {...form.getInputProps('technicalJustification.text')}
                    />
                    <MaxCharsForInputRemaining
                        length={form.values.technicalJustification.text?.length!}
                    />
                    <Select
                        label={"Technical Justification text format"}
                        placeholder={"pick one"}
                        data={textFormatData}
                        pt={"sm"} pb={"lg"}
                        {...form.getInputProps('technicalJustification.format')}
                    />
                <FormSubmitButton
                    form={form}
                    label={"Save"}
                />
                <Space />
                </Stack>
                </Container>
            </form>
        </PanelFrame>
    );
}

export default NewProposalPanel
