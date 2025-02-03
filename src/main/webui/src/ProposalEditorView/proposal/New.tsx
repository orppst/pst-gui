import { SyntheticEvent, useContext } from "react";
import {ProposalContext} from 'src/App2'
import {
    useProposalResourceCreateObservingProposal,
} from "src/generated/proposalToolComponents";
import {
    Investigator,
    Justification,
    ObservingProposal,
    ProposalKind
} from "src/generated/proposalToolSchemas";
import {useNavigate} from "react-router-dom";
import {Container, Grid, Select, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useQueryClient} from "@tanstack/react-query";
import {FormSubmitButton} from 'src/commonButtons/save';
import CancelButton from "src/commonButtons/cancel.tsx";
import { MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS } from "src/constants";
import MaxCharsForInputRemaining from "src/commonInputs/remainingCharacterCount.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";

const kindData = [
    {value: "Standard", label: "Standard"},
    {value: "ToO", label: "T.O.O"},
    {value: "Survey", label: "Survey"}
];


 function NewProposalPanel() {
    const { user} = useContext(ProposalContext) ;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    //mutations
     const createObservingProposal =
         useProposalResourceCreateObservingProposal();

    //single white space as work around to issue of changing format of default justification
    const emptyJustification : Justification = {text: " ", format: "asciidoc"};

    const form = useForm({
        initialValues: {
            "@type": "proposal:ObservingProposal",
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

        //Add the current user as the PI
        const investigator : Investigator = {
            "type": "PI",
            "person": user
        };

        const newProposal :ObservingProposal = {
            ...val,
            "investigators": [investigator]
        };

        createObservingProposal.mutate({
            body: newProposal
        }, {
            onSuccess: (data) => {
                queryClient.invalidateQueries().then(
                    () => navigate("/proposal/" + data._id!)
                );
            },
            onError: (error) =>
                notifyError("Failed to create Observing Proposal", getErrorMessage(error))
        })
    });

     function handleCancel(event: SyntheticEvent) {
         event.preventDefault();
         navigate("/",{relative:"path"})
     }

     return (
        <PanelFrame>
            <PanelHeader itemName={"Create Proposal"} />
            <form onSubmit={createNewObservingProposal}>
                <Container>
                 <ContextualHelpButton messageId="CreaProp" />
                    <Grid>
                        <Grid.Col span={{base: 9}}>
                            <TextInput name="title"
                                       maxLength={MAX_CHARS_FOR_INPUTS}
                                       placeholder="Give your proposal a title"
                                       label={"Title"}
                                       {...form.getInputProps("title")}
                            />
                            <MaxCharsForInputRemaining
                                length={form.values.title.length}
                            />
                        </Grid.Col>
                        <Grid.Col span={{base: 3}}>
                            <Select label={"Kind"}
                                    data={kindData}
                                    {...form.getInputProps("kind")}
                            />
                        </Grid.Col>
                    </Grid>
                    <Textarea name="summary"
                        rows={TEXTAREA_MAX_ROWS}
                        maxLength={MAX_CHARS_FOR_INPUTS}
                        placeholder="A brief summary"
                        label={"Summary"}
                        {...form.getInputProps("summary")}
                    />
                    <MaxCharsForInputRemaining
                        length={form.values.summary.length}
                    />
                     <FormSubmitButton form={form} />
                     <CancelButton
                        onClickEvent={handleCancel}
                        toolTipLabel={"Go back without saving"}
                     />
                </Container>
            </form>
        </PanelFrame>
    );
}

export default NewProposalPanel
