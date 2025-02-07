import {ReactElement, useEffect, useState} from "react";
import {Alert, Box, Button, Group, Loader, Select, Space, Stepper, Tooltip} from "@mantine/core";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {
    SubmittedProposalResourceSubmitProposalVariables,
    useObservationResourceGetObservations,
    useProposalCyclesResourceGetProposalCycles,
    useProposalResourceGetObservingProposalTitle,
    useSubmittedProposalResourceSubmitProposal
} from "../../generated/proposalToolComponents.ts";
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
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import ValidationOverview from "./ValidationOverview.tsx";
import DisplaySubmissionDetails from "./displaySubmissionDetails.tsx";
import {IconCheck} from "@tabler/icons-react";

export default
function SubmissionForm() :
    ReactElement {

    const maxSteps = 4;

    const {selectedProposalCode} = useParams();

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const smallScreen = useMediaQuery("(max-width: 1350px)");

    const [cyclesData, setCyclesData] = useState<{value: string, label: string}[]>([]);

    const [submissionFail, setSubmissionFail] = useState("");

    //for the Stepper
    const [activeStep, setActiveStep] = useState(0);

    const [initialObservationModeTuple, setInitialObservationModeTuple] = useState<ObservationModeTuple[]>([]);

    const proposalTitle = useProposalResourceGetObservingProposalTitle({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    const observations = useObservationResourceGetObservations({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    const proposalCycles = useProposalCyclesResourceGetProposalCycles({
        queryParams: {includeClosed: false}
    });

    const form : UseFormReturnType<SubmissionFormValues> = useForm({
        initialValues: {
            selectedCycle: 0,
            selectedModes: initialObservationModeTuple
        },
        validate: (values) => {
            if (activeStep === 0) {

                console.log("selected cycle: " + values.selectedCycle)
                return {
                    selectedCycle: values.selectedCycle === null || values.selectedCycle === 0 ?
                        'Please select a cycle' : null
                }
            }

            if (activeStep === 2) {
                return {
                    selectedModes: values.selectedModes.some(e => e.modeId === 0) ?
                        'All observations required a mode' : null
                }
            }

            return {}
        }
    });

    const submitProposalMutation = useSubmittedProposalResourceSubmitProposal({
        onSuccess: () => {
            setSubmissionFail("");
            queryClient.invalidateQueries().finally();
            nextStep();
        },
        onError: (error) => {
            setSubmissionFail(getErrorMessage(error))},
        })

    useEffect(() => {
        if (observations.status === 'success') {
            setInitialObservationModeTuple(
                observations.data.map((obs) => (
                    {
                        observationId: obs.dbid!,
                        observationName: obs.name!,
                        observationType: obs.code!,
                        modeId: 0,
                        modeName: ""
                    }
                ))
            )

            form.setFieldValue('selectedModes', initialObservationModeTuple)
        }
    }, [observations.status]);

    useEffect(() => {
        if(proposalCycles.status === 'success')
            setCyclesData(
                proposalCycles.data?.map((cycle) =>(
                    {value: String(cycle.dbid), label: cycle.name!}
                ))
            )
    }, [proposalCycles.status]);

    useEffect(() => {
        //on cycle change reset the selectedModes to initial state
        form.setFieldValue('selectedModes', initialObservationModeTuple)

    }, [form.getValues().selectedCycle]);


    //for the Stepper
    const nextStep = () =>
        setActiveStep((current: number) => {
            if (form.validate().hasErrors) {
                return current;
            }
            return current < maxSteps ? current + 1 : current;
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
                values.selectedModes.map((modeTuple) => {
                    console.log(modeTuple);
                    return modeTuple.modeId;

                })

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


    if (observations.isLoading || proposalCycles.isLoading || proposalTitle.isLoading) {
        return (
            <Box mx={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (proposalTitle.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load proposalTitle"}
                error={getErrorMessage(proposalTitle.error)}
            />
        )
    }

    if (observations.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load observations"}
                error={getErrorMessage(observations.error)}
            />
        )
    }

    if (proposalCycles.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load cycles"}
                error={getErrorMessage(proposalCycles.error)}
            />
        )
    }

    return (
        <form onSubmit={trySubmitProposal}>
            <Stepper
                active={activeStep}
                size={"md"}
                orientation={smallScreen ? 'vertical' : 'horizontal'}
            >
                <Stepper.Step
                    label={"Proposal Cycle"}
                    description={"Choose a cycle"}
                >
                    <Select
                        label={"Please select a proposal cycle"}
                        data={cyclesData}
                        {...form.getInputProps('selectedCycle')}
                    />
                </Stepper.Step>

                <Stepper.Step
                    label={"Proposal Check"}
                    description={"Is your proposal ready?"}
                >
                    <ValidationOverview cycle={form.getValues().selectedCycle} />
                </Stepper.Step>

                <Stepper.Step
                    label={"Observing Modes"}
                    description={"Select modes for your observations"}
                >
                    <ObservationModeSelect form={form} smallScreen={smallScreen}/>
                </Stepper.Step>

                <Stepper.Step
                    label={"Submit Proposal"}
                    description={"Submit to the chosen cycle"}
                >
                    {
                        submissionFail.length === 0 ?
                            <DisplaySubmissionDetails formData={form.getValues()} />
                            :
                            <AlertErrorMessage
                                title={"Submission Failed"}
                                error={submissionFail}
                            />
                    }
                </Stepper.Step>

                <Stepper.Completed>
                    <Space h={"xl"}/>
                    <Alert
                        title={"Submission Complete"}
                        icon={<IconCheck />}
                        color={"green"}
                        mx={"20%"}
                    >
                        You have successfully submitted '{proposalTitle.data}' to
                        '{proposalCycleName(form.getValues().selectedCycle)}'
                    </Alert>
                </Stepper.Completed>
            </Stepper>

            <Group justify="flex-end" mt="xl">
                {
                    activeStep === maxSteps ?
                        <Tooltip
                            label={"go to proposal overview"}
                            openDelay={OPEN_DELAY}
                            closeDelay={CLOSE_DELAY}
                        >
                            <Button onClick={done}>Done</Button>
                        </Tooltip>
                        :
                    activeStep !== 0 &&
                        <Button
                            variant="default"
                            onClick={prevStep}
                        >
                            Back
                        </Button>
                }
                {
                    activeStep === 3 ?
                        <SubmitButton
                            variant={"filled"}
                            disabled={!form.isValid()}
                            label={"Submit proposal"}
                            toolTipLabel={"Submit your proposal to the selected cycle"}
                        />
                        :
                        activeStep !== maxSteps &&
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