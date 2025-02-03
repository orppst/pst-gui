import {ReactElement, useEffect, useState} from "react";
import {Button, Group, ScrollArea, Select, Stepper, Text, Tooltip} from "@mantine/core";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {
    SubmittedProposalResourceSubmitProposalVariables,
    useObservationResourceGetObservations, useProposalCyclesResourceGetProposalCycleDates,
    useProposalCyclesResourceGetProposalCycles, useSubmittedProposalResourceSubmitProposal
} from "../../generated/proposalToolComponents.ts";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useForm, UseFormReturnType} from "@mantine/form";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {
    ObservationConfigMapping
} from "../../generated/proposalToolSchemas.ts";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import ObservationModeSelect from "./observationMode.select.tsx";
import {CLOSE_DELAY, OPEN_DELAY} from "../../constants.tsx";
import {useMediaQuery} from "@mantine/hooks";

export default
function SubmissionForm(props: {isProposalReady: boolean, setSelectedCycle: any }) :
    ReactElement {

    const {selectedProposalCode} = useParams();

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const smallScreen = useMediaQuery("(max-width: 1350px)");

    const [cyclesData, setCyclesData] = useState<{value: string, label: string}[]>([]);

    const [submissionDeadline, setSubmissionDeadline] = useState("");

    const [submissionFail, setSubmissionFail] = useState("");

    //for the Stepper
    const [activeStep, setActiveStep] = useState(0);

    const observations = useObservationResourceGetObservations({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    const [initialObservationModeTuple, setInitialObservationModeTuple] = useState<ObservationModeTuple[]>([]);

    const {data: getCyclesData, status: getCyclesStatus, error: getCyclesError}
        = useProposalCyclesResourceGetProposalCycles({
                queryParams: {includeClosed: false}
            });

    const form : UseFormReturnType<SubmissionFormValues> = useForm({
        initialValues: {
            selectedCycle: 0,
            selectedModes: initialObservationModeTuple
        },
        validate: (values) => {
            if (activeStep === 0) {
                return {
                    selectedCycle: values.selectedCycle === 0 ?
                        'Please select a cycle' : null
                }
            }

            if (activeStep === 1) {
                return {
                    selectedModes: values.selectedModes.some(e => e.modeId === 0) ?
                        'All observations required a mode' : null
                }
            }

            return {}
        }
    });

    const {data: cycleDatesData, status: cycleDatesStatus, error: cycleDatesError}
        = useProposalCyclesResourceGetProposalCycleDates(
            {pathParams: {cycleCode: form.getValues().selectedCycle}});

    const submitProposalMutation = useSubmittedProposalResourceSubmitProposal({
        onSuccess: () => {
            setSubmissionFail("");
            queryClient.invalidateQueries().finally();
            nextStep();
        },
        onError: (error) => {setSubmissionFail("Submission failed, cause: "
            + getErrorMessage(error)
            + "\nThis may be temporary, please try again, if you have tried again please try later")},

        })

    useEffect(() => {
        if (observations.data) {
            setInitialObservationModeTuple(
                observations.data.map((obs) => (
                    {
                        observationId: obs.dbid!,
                        observationName: obs.name!,
                        observationType: obs.code!,
                        modeId: 0
                    }
                ))
            )

            form.setFieldValue('selectedModes', initialObservationModeTuple)
        }
    }, [observations.data]);


    useEffect(() => {
        if(getCyclesError)
            notifyError("Loading Proposal Cycles failed", getErrorMessage(getCyclesError));
        else
            if(getCyclesData !== undefined)
                setCyclesData(
                    getCyclesData?.map((cycle) =>(
                        {value: String(cycle.dbid), label: cycle.name!}
                    ))
                )
    }, [getCyclesStatus]);


    //irritatingly we have to fetch ProposalCycleDates separately --
    // -- perhaps we need a "CycleSynopsis" cf. "ProposalSynopsis"?
    useEffect(() => {
        //inform parent of change to selectedCycle
        props.setSelectedCycle(form.getValues().selectedCycle);

        //reset the selectedModes to initial state
        form.setFieldValue('selectedModes', initialObservationModeTuple)

        if (form.getValues().selectedCycle > 0) {
            if(cycleDatesError)
                notifyError("Failed to load proposal cycle dates", getErrorMessage(cycleDatesError));
            else
                if(cycleDatesData !== undefined)
                    setSubmissionDeadline(cycleDatesData.submissionDeadline!);
        }
        //else do nothing
    }, [cycleDatesStatus]);


    //for the Stepper
    const nextStep = () =>
        setActiveStep((current: number) => {
            if (form.validate().hasErrors) {
                return current;
            }
            return current < 3 ? current + 1 : current;
        });

    const prevStep = () =>
        setActiveStep((current: number) => (current > 0 ? current - 1 : current));

    const done = () => navigate("/proposal/" + selectedProposalCode)

    //extract the proposal cycle name
    const proposalCycleName = (cycleId: number) => (
        cyclesData.find((data) => {
            return (data.value === String(cycleId))
        })?.label
    )


    const trySubmitProposal =
        form.onSubmit((values) => {

            //I feel like there might be a better way to do this using the 'filter' method
            //of an array, but it escapes me at the moment ----------------------

            let allModeIds : number[] =
                values.selectedModes.map((modeTuple) => (
                    modeTuple.modeId
                ))

            let distinctModeIds = [...new Set(allModeIds)];

            let observationConfigMap: ObservationConfigMapping[]  = []

            distinctModeIds.forEach((distinctModeId) => {
                // as 'distinctModeId' has come from 'selectedModes' this will always give an array 'obsIds'
                // of at least length 1
                //@ts-ignore
                let obsIds : number [] = values.selectedModes.map((modeTuple) => {
                    if (distinctModeId === modeTuple.modeId)
                        return modeTuple.observationId;
                })

                observationConfigMap.push({observationIds: obsIds, modeId: distinctModeId})
            })

            //------------------------------------------------------------------------

            const submissionVariables: SubmittedProposalResourceSubmitProposalVariables = {
                pathParams: {cycleCode: values.selectedCycle},
                body: {
                    proposalId: Number(selectedProposalCode),
                    config: observationConfigMap
                },
                // @ts-ignore
                headers: {"Content-Type": "application/json"}
            };

            submitProposalMutation.mutate(submissionVariables);

        });

    return (
        <form onSubmit={trySubmitProposal}>
            <Stepper
                active={activeStep}
                size={"md"}
                orientation={smallScreen ? 'vertical' : 'horizontal'}
            >
                <Stepper.Step label={"Proposal Cycle"} description={"Choose a cycle"}>
                    <Select
                        label={"Please select a proposal cycle"}
                        description={submissionDeadline === "" ?
                            "Submission deadline: " : "Submission deadline: " + submissionDeadline}
                        data={cyclesData}
                        {...form.getInputProps('selectedCycle')}
                    />
                </Stepper.Step>
                <Stepper.Step label={"Observing Modes"} description={"Select modes for your observations"}>
                    <ScrollArea h={200}>
                        <ObservationModeSelect form={form}/>
                    </ScrollArea>
                </Stepper.Step>
                <Stepper.Step label={"Submit Proposal"} description={"Submit to the chosen cycle"}>
                    {
                        submissionFail.length === 0 ?
                            <Text>
                                Your proposal can now be submitted to {proposalCycleName(form.getValues().selectedCycle)}
                            </Text>
                            :
                            <Text c={"red"}>
                                {submissionFail}
                            </Text>
                    }
                </Stepper.Step>
                <Stepper.Completed>
                    <Text c={"green"}>
                        Your proposal has be submitted to {proposalCycleName(form.getValues().selectedCycle)}
                    </Text>
                </Stepper.Completed>
            </Stepper>
            <Group justify="flex-end" mt="xl">
                {
                    activeStep === 3 ?
                        <Tooltip
                            label={"go to proposal overview"}
                            openDelay={OPEN_DELAY}
                            closeDelay={CLOSE_DELAY}
                        >
                            <Button onClick={done}>Done</Button>
                        </Tooltip>
                        :
                    activeStep !== 0 &&
                        <Button variant="default" onClick={prevStep}>Back</Button>
                }
                {
                    activeStep === 2 ?
                        <SubmitButton
                            disabled={!form.isValid() || !props.isProposalReady}
                            label={"Submit proposal"}
                            toolTipLabel={"Submit your proposal to the selected cycle"}
                        />
                        :
                        activeStep !== 3 &&
                        <Button
                            onClick={nextStep}
                        >
                            Next step
                        </Button>

                }
            </Group>
        </form>
    )
}