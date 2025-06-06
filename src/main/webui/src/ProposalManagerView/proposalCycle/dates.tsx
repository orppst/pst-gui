import {ReactElement, useEffect, useState} from "react";
import {Group, Stack, Text} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {FormSubmitButton} from "../../commonButtons/save.tsx";
import {useParams} from "react-router-dom";
import {
    useProposalCyclesResourceGetProposalCycleDates,
    useProposalCyclesResourceReplaceCycleDeadline,
    useProposalCyclesResourceReplaceCycleSessionEnd,
    useProposalCyclesResourceReplaceCycleSessionStart
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {HaveRole} from "../../auth/Roles.tsx";

export default function CycleDatesPanel() : ReactElement {
    interface updateDatesForm {
        submissionDeadline: Date | null,
        sessionStart: Date | null,
        sessionEnd: Date | null
    }

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
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

    const replaceDeadlineMutation = useProposalCyclesResourceReplaceCycleDeadline({
        onSuccess: () => {
            notifySuccess("Update dates", "Changes saved");
            form.resetDirty();
        },
        onError: (error) => {
            notifyError("Update session deadline error", getErrorMessage(error));
        }
    });

    const replaceCycleEndMutation = useProposalCyclesResourceReplaceCycleSessionEnd({
        onSuccess: () => {
            replaceDeadlineMutation.mutate({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                body: form.values.submissionDeadline?.getTime().toString()
            });
        },
        onError: (error) => {
            notifyError("Update session end error", getErrorMessage(error));
        }
    });

    const replaceCycleStartMutation = useProposalCyclesResourceReplaceCycleSessionStart({
        onSuccess: () => {
            replaceCycleEndMutation.mutate({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                body: form.values.sessionEnd?.getTime().toString()
            });
            form.resetDirty();
        },
        onError: (error) => {
            notifyError("Update session start error", getErrorMessage(error));
        }
    });

    const handleSave = form.onSubmit((val) => {
        replaceCycleStartMutation.mutate({
            pathParams: {cycleCode: Number(selectedCycleCode)},
            body: val.sessionStart?.getTime().toString()
        })
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
                            //minDate={new Date()}
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