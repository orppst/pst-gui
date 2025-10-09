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
import {useProposalToolContext} from "../../generated/proposalToolContext.ts";

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

    const [initialModeTuple, setInitialModeTuple] = useState<ObservationModeTuple[]>([]);

    const [proposalCheck, setProposalCheck] = useState<boolean>(false);

    const {fetcherOptions} = useProposalToolContext();

    const proposalTitle = useProposalResourceGetObservingProposalTitle({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    const targetObservations = useObservationResourceGetObservations({
        pathParams: {proposalCode: Number(selectedProposalCode)},
        queryParams: {type: "TargetObservation"}
    })

    const calibrationObservations = useObservationResourceGetObservations({
        pathParams: {proposalCode: Number(selectedProposalCode)},
        queryParams: {type: "CalibrationObservation"}
    })

    const proposalCycles = useProposalCyclesResourceGetProposalCycles({
        queryParams: {includeClosed: false}
    });

    const form : UseFormReturnType<SubmissionFormValues> = useForm({
        initialValues: {
            selectedCycle: 0,
            selectedModes: initialModeTuple
        },
        validate: (values) => {
            if (activeStep === 0) {
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
        if (targetObservations.status === 'success' && calibrationObservations.status === 'success') {

            let targetTuples = targetObservations.data.map((obs) => (
                {
                    observationId: obs.dbid!,
                    observationName: obs.name!,
                    observationType: obs.code!,
                    modeId: 0,
                    modeName: ""
                }
            ))

            let calibrationTuples = calibrationObservations.data.map((obs) => (
                {
                    observationId: obs.dbid!,
                    observationName: obs.name!,
                    observationType: obs.code!,
                    modeId: 0,
                    modeName: ""
                }
            ))

            setInitialModeTuple(targetTuples.concat(calibrationTuples))

            form.setFieldValue('selectedModes', initialModeTuple)
        }
        //on initial load this does not seem to trigger on the 'status's alone,
        //use 'activeStep' as a dependency to get it to work
    }, [targetObservations.status, calibrationObservations.status]);

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
        form.setFieldValue('selectedModes', initialModeTuple)

    }, [form.getValues().selectedCycle]);

    //for the Stepper
    const nextStep = () =>
        setActiveStep((current: number) => {

            //prevents advancement to the next step on invalid proposal
            if (current == 1 && !proposalCheck) {

                return current;
            }

            //prevents advancement to the next step on invalid form fields
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


    const handleSubmitProposal =
        form.onSubmit((values) => {

            //I feel like there might be a better way to do this using the 'filter' method
            //of an array, but it escapes me at the moment ----------------------

            let allModeIds : number[] =
                values.selectedModes.map((modeTuple) => {
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
                headers: {"Content-Type": "application/json", ...fetcherOptions.headers}
            };

            submitProposalMutation.mutate(submissionVariables);

        });


    if (targetObservations.isLoading || calibrationObservations.isLoading ||
        proposalCycles.isLoading || proposalTitle.isLoading)
    {
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

    if (targetObservations.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load target observations"}
                error={getErrorMessage(targetObservations.error)}
            />
        )
    }

    if (calibrationObservations.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load calibration observations"}
                error={getErrorMessage(calibrationObservations.error)}
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
        <form onSubmit={handleSubmitProposal}>
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
                        allowDeselect={false}
                        {...form.getInputProps('selectedCycle')}
                    />
                </Stepper.Step>

                <Stepper.Step
                    label={"Proposal Check"}
                    description={"Is your proposal ready?"}
                >
                    <ValidationOverview
                        cycle={form.getValues().selectedCycle}
                        smallScreen={smallScreen}
                        setProposalCheck={setProposalCheck}
                    />
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
                            <DisplaySubmissionDetails
                                formData={form.getValues()}
                                smallScreen={smallScreen}
                            />
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
                        <Tooltip
                            label={form.getValues().selectedCycle === 0 ? 'Please select a cycle' :
                                (activeStep === 1 && !proposalCheck) ?
                                    'Your proposal is not ready, please check the errors' :
                                    (activeStep == 2 && form.getValues().selectedModes.some(
                                        e => e.modeId === 0)) ?
                                        'All observations require a mode' :
                                        'Go to next step'}
                            openDelay={OPEN_DELAY}
                            closeDelay={CLOSE_DELAY}
                        >
                            <Button
                                onClick={nextStep}
                                disabled={form.getValues().selectedCycle === 0 ||
                                    (activeStep === 1 && !proposalCheck) ||
                                    (activeStep == 2 && form.getValues().selectedModes.some(
                                            e => e.modeId === 0)
                                    )}
                            >
                                Next step
                            </Button>
                        </Tooltip>

                }
            </Group>
        </form>
    )
}