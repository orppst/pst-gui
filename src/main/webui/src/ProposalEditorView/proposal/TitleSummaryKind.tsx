import {ReactElement, useEffect, useState} from "react";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {useParams} from "react-router-dom";
import {ProposalKind} from "../../generated/proposalToolSchemas.ts";
import {useForm} from "@mantine/form";
import {Fieldset, Grid, Select, Space, Stack, Textarea, TextInput} from "@mantine/core";
import {MAX_CHARS_FOR_INPUTS, TEXTAREA_MAX_ROWS} from "../../constants.tsx";
import MaxCharsForInputRemaining from "../../commonInputs/remainingCharacterCount.tsx";
import {
    useProposalResourceChangeKind,
    useProposalResourceGetObservingProposal,
    useProposalResourceReplaceSummary,
    useProposalResourceReplaceTitle
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useDebouncedCallback} from "@mantine/hooks";
import * as React from "react";

interface TitleSummaryKind {
    title: string
}

//more like naughtyData
const kindData = [
    {value: "Standard", label: "Standard"},
    {value: "ToO", label: "T.O.O"},
    {value: "Survey", label: "Survey"}
];


export default
function TitleSummaryKind() : ReactElement {
    const {selectedProposalCode} = useParams();

    const queryClient = useQueryClient();

    const proposal = useProposalResourceGetObservingProposal({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    const [summary, setSummary] = useState(proposal.data?.summary);

    const [kind, setKind] = useState<ProposalKind>(proposal.data?.kind!);

    const titleMutation = useProposalResourceReplaceTitle();

    const summaryMutation = useProposalResourceReplaceSummary();

    const kindMutation = useProposalResourceChangeKind();

    const summaryDebounce = useDebouncedCallback((summary: string) => {
        summaryMutation
            .mutate(
                {
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    body: summary,
                    //@ts-ignore
                    headers: {"Content-Type": "text/plain"}
                },
                {
                    onSuccess: () =>
                        notifySuccess("Summary Updated", "Your changes to the summary have been saved")
                    ,
                    onError: (error) =>
                        notifyError("Failed to update summary", getErrorMessage(error))
                })
    }, 1000)

    const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSummary(e.currentTarget.value);
        summaryDebounce(e.currentTarget.value)
    }

    const handleKindChange = (kind: string) => {
        setKind(kind as ProposalKind);
        kindMutation
            .mutate(
                {
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    body: kind,
                    //@ts-ignore
                    headers: {"Content-Type": "text/plain"}
                },
                {
                    onSuccess: (data) =>
                        notifySuccess("Kind Updated", "Kind changed to: " + data)
                    ,
                    onError: (error) =>
                        notifyError("Failed to update kind", getErrorMessage(error))
                })

    }

    const form = useForm<TitleSummaryKind>({
        mode: "controlled",
        initialValues: {
            title: proposal.data?.title!
        },
        validate: {
            title: (value) =>
                value.length < 1 ? 'The title cannot be empty' : null
        }
    })

    useEffect(() => {
        if (proposal.status === 'success') {
            form.setValues({
                title: proposal.data.title!,
            })
            form.resetDirty()
        }
    }, [proposal.status, proposal.data]);


    const TitleInput = () : ReactElement => {
        return (
            <Stack>
                <TextInput
                    label={form.isDirty('title') ? "Title (unsaved changes)" : "Title"}
                    name="title"
                    maxLength={MAX_CHARS_FOR_INPUTS}
                    description={"make changes then click update"}
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
                    description={"saves after a pause in typing"}
                    name="summary"
                    value={summary}
                    onChange={handleSummaryChange}
                />
                <MaxCharsForInputRemaining length={summary?.length ?? 0} />
            </Stack>
        )
    }

    const KindInput = () : ReactElement => {
        return (
            <Select label={"Kind"}
                    description={"saves on change"}
                    data={kindData}
                    allowDeselect={false}
                    value={kind}
                    onChange={(value) => {
                        handleKindChange(value!)
                    }}
            />
        )
    }

    const handleSubmit = form.onSubmit((_values) => {
        titleMutation
            .mutate(
                {
                    pathParams: {proposalCode: Number(selectedProposalCode)},
                    body: form.getValues().title,
                    //@ts-ignore
                    headers: {"Content-Type": "text/plain"},
                },
                {
                    onSuccess: (data) => {
                        notifySuccess("Title Updated", "Title changed to: " + data);
                        queryClient.invalidateQueries().then();
                    }
                        ,
                    onError: (error) =>
                        notifyError("Failed to update title", getErrorMessage(error))
                }
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
                <Stack>
                    <form onSubmit={handleSubmit}>
                        <Grid>
                            <Grid.Col span={10}>
                                {TitleInput()}
                            </Grid.Col>
                            <Grid.Col span={2}>
                                <Space h={"45"}/>
                                <FormSubmitButton
                                    variant={"filled"}
                                    form={form}
                                    label={"Update Title"}
                                    toolTipLabel={"Save Changes"}
                                    notValidToolTipLabel={"Title must be at least one character"}
                                    notDirtyToolTipLabel={"Title has not been modified"}
                                />
                            </Grid.Col>
                        </Grid>
                    </form>
                    {SummaryInput()}
                    {KindInput()}
                </Stack>
            </Fieldset>
        </PanelFrame>
    )
}