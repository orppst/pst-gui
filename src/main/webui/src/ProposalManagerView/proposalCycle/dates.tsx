import {ReactElement, useEffect, useState} from "react";
import {Badge, Container, Group, Stack, Text, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import {DatesProvider, DateTimePicker} from "@mantine/dates";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {
    fetchProposalCyclesResourceReplaceCycleDeadline,
    fetchProposalCyclesResourceReplaceCycleSessionEnd,
    fetchProposalCyclesResourceReplaceCycleSessionStart,
    useProposalCyclesResourceGetProposalCycleDates
} from "../../generated/proposalToolComponents.ts";
import {JSON_SPACES} from "../../constants.tsx";

export default function CycleDatesPanel() : ReactElement {
    interface updateDatesForm {
        submissionDeadline: Date | null,
        sessionStart: Date | null,
        sessionEnd: Date | null
    }

    const {selectedCycleCode} = useParams();
    const navigate = useNavigate();
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

        if(val.submissionDeadline !== new Date(data?.submissionDeadline as string)) {
            console.log("New submission deadline is "+ val.submissionDeadline?.toJSON());
            promises.push(fetchProposalCyclesResourceReplaceCycleDeadline({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                //@ts-ignore
                body: val.submissionDeadline?.getTime()
            })
                .catch(console.log));
        }
        if(val.sessionStart !== new Date(data?.observationSessionStart as string)) {
            console.log("New session start is "+ val.sessionStart?.toJSON());
            promises.push(fetchProposalCyclesResourceReplaceCycleSessionStart({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                //@ts-ignore
                body: val.sessionStart?.getTime()
            })
                .catch(console.log));
        }
        if(val.sessionEnd !== new Date(data?.observationSessionEnd as string)) {
            console.log("New session end is "+ val.sessionEnd?.toJSON());
            promises.push(fetchProposalCyclesResourceReplaceCycleSessionEnd({
                pathParams: {cycleCode: Number(selectedCycleCode)},
                //@ts-ignore
                body: val.sessionEnd?.getTime()
            })
                .catch(console.log));
        }

        Promise.all(promises).then(()=>navigate(  "../", {relative:"path"}));
    });

    return (
        <Container fluid>
            <Title order={3}>
                { isLoading ?
                    <Badge size={"xl"} radius={0}>...</Badge> :
                    <Badge size={"xl"} radius={0}>{proposalCycleTitle}</Badge>
                } : Dates
            </Title>

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