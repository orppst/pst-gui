import {ReactElement, useEffect} from "react";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {ProposalKind} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {Fieldset, Group, Loader, Select, Stack, Textarea, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS} from "../../constants.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
    fetchProposalResourceChangeKind,
    fetchProposalResourceReplaceSummary,
    fetchProposalResourceReplaceTitle, ProposalResourceChangeKindVariables, ProposalResourceReplaceSummaryVariables,
    ProposalResourceReplaceTitleVariables, useProposalResourceGetObservingProposal
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";


interface TitleSummaryKind {
    title: string,
    summary: string,
    kind: ProposalKind
}

const kindData = [
    {value: "Standard", label: "Standard"},
    {value: "ToO", label: "T.O.O"},
    {value: "Survey", label: "Survey"}
];


export default
function TitleSummaryKind() : ReactElement {

    const {selectedProposalCode} = useParams();

    const proposal = useProposalResourceGetObservingProposal({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    const form = useForm<TitleSummaryKind>({
        mode: "controlled",
        initialValues: {
            title: proposal.data?.title!,
            summary: proposal.data?.summary!,
            kind: proposal.data?.kind!
        },
        validate: {
            title: (value) =>
                value && value.length < 1 ? 'The title cannot be empty' : null,
            summary: (value) =>
                value && value.length < 0 ? 'The summary cannot be empty' : null
        }
    })

    const queryClient = useQueryClient();

    //IMPL the code generator does not create the correct type signature for API calls where
    // the body is plain text, so we use mutation functions for each field in the form

    const titleMutation = useMutation({
        mutationFn: () => {

            const newTitle : ProposalResourceReplaceTitleVariables = {
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: form.getValues().title,
                // @ts-ignore
                headers: {"Content-Type": "text/plain"}
            }
            return fetchProposalResourceReplaceTitle(newTitle);
        },
        onError: (error) => {
            notifyError("Failed to change Title", getErrorMessage(error))
        },
        onSuccess: () => {
            if (form.isDirty('title'))
                notifySuccess("Title Updated", "Title changed to: " + form.getValues().title);
        },
    })

    const summaryMutation = useMutation({
            mutationFn: () => {
                const newSummary: ProposalResourceReplaceSummaryVariables = {
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    body: form.getValues().summary,
                    // @ts-ignore
                    headers: {"Content-Type": "text/plain"}
                }
                return fetchProposalResourceReplaceSummary(newSummary);
            },
            onError: (error) => {
                notifyError("Failed to change Summary", getErrorMessage(error));
            },
            onSuccess: () => {
                if (form.isDirty('summary'))
                    notifySuccess("Summary Updated", "changes to the summary have been saved");
            }
        }
    );

    const kindMutation = useMutation({
        mutationFn: () => {
            const newKind: ProposalResourceChangeKindVariables = {
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: form.getValues().kind as string,
                //@ts-ignore
                headers: {"Content-Type": "text/plain"}
            }
            return fetchProposalResourceChangeKind(newKind);
        },
        onError: (error) => {
            notifyError("Failed to change Kind", getErrorMessage(error))
        },
        onSuccess: () => {
            if (form.isDirty('kind'))
                notifySuccess("Kind Updated", "Kind changed to: " + form.getValues().kind)
        }
    })

    useEffect(() => {
        if (proposal.status === 'success') {
            form.setValues({
                title: proposal.data.title!,
                summary: proposal.data.summary!,
                kind: proposal.data.kind!
            })
            form.resetDirty()
        }
    }, [proposal.status, proposal.data]);


    const TitleInput = () : ReactElement => {
        return (
            <Stack>
                <TextInput
                    label={"Title"}
                    name="title"
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    withAsterisk={form.isDirty('title')}
                    {...form.getInputProps('title')}
                />
                <MaxCharsForInputRemaining length={form.getValues().title?.length ?? 0} />
            </Stack>
        )
    }

    const SummaryInput = () : ReactElement => {
        return (
            <Stack>
                <Textarea
                    label={"Summary"}
                    rows={TEXTAREA_MAX_ROWS}
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    name="summary"
                    withAsterisk={form.isDirty('summary')}
                    {...form.getInputProps('summary')}
                />
                <MaxCharsForInputRemaining length={form.getValues().summary?.length ?? 0} />
            </Stack>
        )
    }

    const KindInput = () : ReactElement => {
        return (
            <Select label={"Kind"}
                    data={kindData}
                    allowDeselect={false}
                    withAsterisk={form.isDirty('kind')}
                    {...form.getInputProps("kind")}
            />
        )
    }

    const handleSubmit = form.onSubmit((_values) => {

        //Note all three fields are replaced regardless of form.isDirty result, but update notifications to the
        //user are shown only if the field is "dirty" (see the "onSuccess" property of the mutation) - yes
        //this is cheating but React is driving me up the wall.

        titleMutation.mutateAsync()
            .then(() => summaryMutation.mutateAsync()
                .then(() => kindMutation.mutateAsync()
                    .then(() => queryClient.invalidateQueries())
                    .then(() => form.resetDirty())
                )
            )
    })

    return (
        <PanelFrame>
            <PanelHeader
                itemName={proposal.data?.title!}
                panelHeading={"Title, Summary, Kind"}
                isLoading={proposal.isLoading}
            />

            <Fieldset legend={"Edit Form for Title, Summary, and Kind"}>
                <form onSubmit={handleSubmit}>
                    <Stack>
                        {TitleInput()}
                        {SummaryInput()}
                        {KindInput()}
                        <Group justify={"flex-end"}>
                            {
                                form.isValid() && form.isDirty() &&
                                <Loader type={"bars"} color={"blue"}/>
                            }
                            <FormSubmitButton
                                variant={"filled"}
                                form={form}
                            />
                        </Group>
                    </Stack>
                </form>
            </Fieldset>
        </PanelFrame>
    )
}