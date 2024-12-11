import {ReactElement, useEffect, useState} from "react";
import {Group, Stack, Text} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceReplaceCycleDeadline,
    fetchProposalCyclesResourceReplaceCycleSessionEnd,
    fetchProposalCyclesResourceReplaceCycleSessionStart,
    useProposalCyclesResourceGetProposalCycleDates
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export default function CycleDatesPanel() : ReactElement {
    interface updateDatesForm {
        submissionDeadline: Date | null,
        sessionStart: Date | null,
        sessionEnd: Date | null
    }

    const {selectedCycleCode} = useParams();
    const [proposalCycleTitle, setCycleTitle] = useState("Loading...")
    const {data, error, isLoading, status} =
        useProposalCyclesResourceGetProposalCycleDates(
            {pathParams: {cycleCode: Number(selectedCycleCode)}}
        );

    const form = useForm<updateDatesForm>(
        {
            validateInputOnChange: true,
            initialValues: {
                submissionDeadline: null,
                sessionStart: null,
                sessionEnd: null
            },

            validate: {
                submissionDeadline:
                    value => (value === null ? 'Loading...' : null),
                sessionStart:
                    value => (value === null ? 'Loading...' : null),
                sessionEnd:
                    value => (value === null ? 'Loading...' : null),
            }
        }
    );

    useEffect(() => {
        if (status === 'success') {
            setCycleTitle(data?.title as string);
            form.values.submissionDeadline = new Date(data?.submissionDeadline as string);
            form.values.sessionStart = new Date(data?.observationSessionStart as string);
            form.values.sessionEnd = new Date(data?.observationSessionEnd as string);
        }
    }, [status,data]);

    if (error) {
        return (
            <PanelFrame>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </PanelFrame>
        );
    }

    const handleSave = form.onSubmit((val) => {
        fetchProposalCyclesResourceReplaceCycleDeadline({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                //@ts-ignore
                body: val.submissionDeadline?.getTime()
            })
            .then(() => {
                fetchProposalCyclesResourceReplaceCycleSessionStart({
                    pathParams: {cycleCode: Number(selectedCycleCode)},
                    //@ts-ignore
                    body: val.sessionStart?.getTime()
                }).then(() => {
                    fetchProposalCyclesResourceReplaceCycleSessionEnd({
                        pathParams: {cycleCode: Number(selectedCycleCode)},
                        //@ts-ignore
                        body: val.sessionEnd?.getTime()
                    }).then(() => {
                        notifySuccess("Update dates", "Changes saved");
                        form.resetDirty();
                    })
                    .catch((fault)=>notifyError("Update dates", "Error saving "
                        + getErrorMessage(fault)))
                })
                .catch((fault)=>notifyError("Update dates", "Error saving "
                    + getErrorMessage(fault)))
            })
            .catch((fault)=>notifyError("Update dates", "Error saving "
                + getErrorMessage(fault)))
    });

    return (
        <PanelFrame>
            <PanelHeader isLoading={isLoading} itemName={proposalCycleTitle} panelHeading={"Dates"}/>

            <form onSubmit={handleSave}>
                <DatesProvider settings={{timezone: 'UTC'}}>
                    <Stack>
                        <Group justify={"center"}>
                            <Text size={"sm"} c={"teal"}> Dates and times are treated as UTC</Text>
                        </Group>
                        <DateTimePicker
                            valueFormat={"YYYY/MM/DD HH:mm"}
                            label={"Submission deadline"}
                            placeholder={"select a proposal submission deadline"}
                            minDate={new Date()}
                            {...form.getInputProps('submissionDeadline')}
                        />
                        <DateTimePicker
                            valueFormat={"YYYY/MM/DD HH:mm"}
                            label={"Observation session start"}
                            placeholder={"select an observation session start"}
                            minDate={new Date()}
                            {...form.getInputProps('sessionStart')}
                        />
                        <DateTimePicker
                            valueFormat={"YYYY/MM/DD HH:mm"}
                            label={"Observation session end"}
                            placeholder={"select an observation session end"}
                            minDate={new Date()}
                            {...form.getInputProps('sessionEnd')}
                        />
                        <FormSubmitButton form={form} />
                    </Stack>
                </DatesProvider>

            </form>
        </PanelFrame>
    )
}