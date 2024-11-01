import {ReactElement, useEffect, useState} from "react";
import {Button, Group, ScrollArea, Select, Stepper} from "@mantine/core";
import {SubmitButton} from "../../commonButtons/save.tsx";
import {
    fetchProposalCyclesResourceGetProposalCycleDates,
    fetchProposalCyclesResourceGetProposalCycles,
    fetchSubmittedProposalResourceSubmitProposal,
    SubmittedProposalResourceSubmitProposalVariables, useObservationResourceGetObservations
} from "../../generated/proposalToolComponents.ts";
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useForm, UseFormReturnType} from "@mantine/form";
import {useNavigate, useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {
    ObjectIdentifier,
    ObservationConfigMapping
} from "../../generated/proposalToolSchemas.ts";
import {ObservationModeTuple, SubmissionFormValues} from "./submitPanel.tsx";
import ObservationModeSelect from "./observationMode.select.tsx";

export default
function SubmissionForm(props: {isProposalReady: boolean, setSelectedCycle: any }) :
    ReactElement {

    const {selectedProposalCode} = useParams();

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const [cyclesData, setCyclesData] = useState<{value: string, label: string}[]>([]);

    const [submissionDeadline, setSubmissionDeadline] = useState("");


    //for the Stepper
    const [activeStep, setActiveStep] = useState(0);

    const observations = useObservationResourceGetObservations({
        pathParams: {proposalCode: Number(selectedProposalCode)}
    })

    let emptyObservationModeTuple : ObservationModeTuple[] = []

    const form : UseFormReturnType<SubmissionFormValues> = useForm({
        initialValues: {
            selectedCycle: 0,
            selectedModes: emptyObservationModeTuple
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

    useEffect(() => {
        if (observations.data) {
            //form.initialize called once only regardless of changes
            form.initialize({
                selectedCycle: 0,
                selectedModes: observations.data.map((obs) => (
                    {
                        observationId: obs.dbid!,
                        observationName: obs.name!,
                        observationType: obs.code!,
                        modeId: 0
                    }
                ))
            })
        }
    }, [observations.data]);


    useEffect(() => {
        fetchProposalCyclesResourceGetProposalCycles({
            queryParams: {includeClosed: false}
        })
            .then((data: ObjectIdentifier[])=> {
                setCyclesData(
                    data?.map((cycle) =>(
                        {value: String(cycle.dbid), label: cycle.name!}
                    ))
                )
            })
            .catch((error) => {
                notifyError("Loading Proposal Cycles failed", getErrorMessage(error))
            })
    }, []);


    //irritatingly we have to fetch ProposalCycleDates separately --
    // -- perhaps we need a "CycleSynopsis" cf. "ProposalSynopsis"?
    useEffect(() => {
        if (form.getValues().selectedCycle > 0) {
            fetchProposalCyclesResourceGetProposalCycleDates(
                {pathParams: {cycleCode: form.getValues().selectedCycle}})
                .then((dates) => {
                    setSubmissionDeadline(dates.submissionDeadline!);
                })
                .catch((error) => {
                    notifyError("Failed to load proposal cycle dates", getErrorMessage(error))
                })
        }
        //else do nothing
    }, [form.getValues().selectedCycle]);


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

            fetchSubmittedProposalResourceSubmitProposal(submissionVariables)
                .then(()=> {
                    notifySuccess("Submission successful", "Your proposal has been submitted");
                    queryClient.invalidateQueries().then();
                    navigate("/proposal/" + selectedProposalCode);
                })
                .catch((error) => notifyError("Submission failed", getErrorMessage(error))
                )
        });

    return (
        <form onSubmit={trySubmitProposal}>
            <Stepper active={activeStep}>
                <Stepper.Step label={"Proposal Cycle"} description={"Choose a cycle"}>
                    <Select
                        label={"Please select a proposal cycle"}
                        description={submissionDeadline === "" ?
                            "Submission deadline: " : "Submission deadline: " + submissionDeadline}
                        data={cyclesData}
                        {...form.getInputProps("selectedCycle")}
                        onChange={(value) => {
                            props.setSelectedCycle(Number(value));
                            form.setFieldValue('selectedCycle', Number(value))
                        }}
                    />
                </Stepper.Step>
                <Stepper.Step label={"Observing Modes"} description={"Select modes for your observations"}>
                    <ScrollArea h={200}>
                        <ObservationModeSelect form={form}/>
                    </ScrollArea>
                </Stepper.Step>
                <Stepper.Step label={"Submit"} description={"submit your proposal to the chosen cycle"}>
                    <SubmitButton
                        disabled={!form.isValid() || !props.isProposalReady}
                        label={"Submit proposal"}
                        toolTipLabel={"Submit your proposal to the selected cycle"}
                    />
                </Stepper.Step>
                <Stepper.Completed>
                    Your proposal has be submitted to the cycle
                </Stepper.Completed>
            </Stepper>
            <Group justify="flex-end" mt="xl">
                {activeStep !== 0 && (
                    <Button variant="default" onClick={prevStep}>
                        Back
                    </Button>
                )}
                {activeStep !== 3 && <Button onClick={nextStep}>Next step</Button>}
            </Group>
        </form>
    )
}