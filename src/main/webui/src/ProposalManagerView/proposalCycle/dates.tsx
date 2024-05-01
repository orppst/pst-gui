import {ReactElement, useEffect, useState} from "react";
import {Container, Group, Stack, Text} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceReplaceCycleDeadline,
    fetchProposalCyclesResourceReplaceCycleSessionEnd,
    fetchProposalCyclesResourceReplaceCycleSessionStart,
    useProposalCyclesResourceGetProposalCycleDates
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";
import {notifications} from "@mantine/notifications";
import {PanelTitle} from "../../commonPanelFeatures/title.tsx";

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
            <Container>
                <pre>{JSON.stringify(error, null, JSON_SPACES)}</pre>
            </Container>
        );
    }

    const handleSave = form.onSubmit((val) => {
        const promises=[];

        if(val.submissionDeadline?.getTime() !== new Date(data?.submissionDeadline as string).getTime()) {
            promises.push(fetchProposalCyclesResourceReplaceCycleDeadline({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                //@ts-ignore
                body: val.submissionDeadline?.getTime()
            }));
        }
        if(val.sessionStart?.getTime() !== new Date(data?.observationSessionStart as string).getTime()) {
            promises.push(fetchProposalCyclesResourceReplaceCycleSessionStart({
                pathParams: {cycleCode: Number(selectedCycleCode)+6},
                //@ts-ignore
                body: val.sessionStart?.getTime()
            }));
        }
        if(val.sessionEnd?.getTime() !== new Date(data?.observationSessionEnd as string).getTime()) {
            promises.push(fetchProposalCyclesResourceReplaceCycleSessionEnd({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                //@ts-ignore
                body: val.sessionEnd?.getTime()
            }))
        }
        // FIXME: Make this .catch() work correctly
        Promise.all(promises).then(()=>{
                notifications.show({
                    autoClose:5000,
                    title: "Update dates",
                    message: "Changes saved",
                    color:"green",
                    className:'my-notifications-class'
                });
                form.resetDirty();
            })
            .catch((fault)=>
                notifications.show({
                    autoClose:5000,
                    title:"Update dates",
                    message:"Error saving " + fault,
                    color:"red",
                    className:'my-notifications-class'
                }));

    });

    return (
        <Container fluid>
            <PanelTitle isLoading={isLoading} itemName={proposalCycleTitle} panelTitle={"Dates"}/>

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
                        <SubmitButton
                            label={"Save"}
                            toolTipLabel={"Update the proposal cycle dates"}
                            disabled={!form.isDirty()}
                        />
                    </Stack>
                </DatesProvider>

            </form>
        </Container>
    )
}