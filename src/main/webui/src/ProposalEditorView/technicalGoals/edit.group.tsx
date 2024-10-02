import PerformanceParametersSection from "./performance.form.tsx";
import SpectralWindowsSection from "./spectrum.form.tsx";
import {Grid, Stack} from "@mantine/core";
import {TechnicalGoalProps} from "./technicalGoalsPanel.tsx";
import { ReactElement, SyntheticEvent } from 'react';
import {useParams, useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {
    convertToScienceSpectralWindow,
    convertToScienceSpectralWindowGui,
    ScienceSpectralWindowGui
} from "./scienceSpectralWindowGui.tsx";
import {useForm} from "@mantine/form";
import {PerformanceParameters, TechnicalGoal} from "src/generated/proposalToolSchemas.ts";
import {
    fetchTechnicalGoalResourceAddSpectrum,
    fetchTechnicalGoalResourceAddTechnicalGoal,
    fetchTechnicalGoalResourceReplacePerformanceParameters, fetchTechnicalGoalResourceReplaceSpectrum
} from "src/generated/proposalToolComponents.ts";
import {FormSubmitButton} from "src/commonButtons/save.tsx";
import CancelButton from "src/commonButtons/cancel.tsx";
import {
    convertToPerformanceParameters,
    convertToPerformanceParametersGui,
    PerformanceParametersGui
} from "./performanceParametersGui.tsx";
import {notifySuccess} from "../../commonPanel/notifications.tsx";
import {ContextualHelpButton} from "src/commonButtons/contextualHelp.tsx";

export const notSpecified = "not specified";
export const notSet = "not set";

/**
 * interface for the TechnicalGoal Form values.
 * @param {PerformanceParametersGui} performanceParameters parameters to use with the Mantine form inputs
 * @param {ScienceSpectralWindowGui[]} spectralWindows array of spectral windows on which to focus for the observation
 */
export interface TechnicalGoalValues {
    technicalGoalId: number | undefined,
    performanceParameters: PerformanceParametersGui,
    spectralWindows: ScienceSpectralWindowGui [],
}

/**
 * creates the Technical Goals form
 * @param {TechnicalGoalProps} props the data needed to create the technical
 * goal edit group.
 * @return {ReactElement} the html for the technical goal edit page.
 * @constructor
 */
export default function TechnicalGoalEditGroup(
    props: TechnicalGoalProps ): ReactElement {

    // integers specifying the proportional number of columns for the performance parameter
    // section and the spectral window section
    const TOTAL_COLUMNS = 10;
    const PERFORMANCE_COLUMNS = 4;
    const SPECTRUM_COLUMNS = TOTAL_COLUMNS - PERFORMANCE_COLUMNS
    // setup default values (proposal code, query system,
    // and the technical goal)
    const {selectedProposalCode} = useParams();
    const queryClient = useQueryClient();
    const newTechnicalGoal = !props.technicalGoal;

    // use spectral windows if we have them, else use empty array
    let initialSpectralWindows: ScienceSpectralWindowGui[] = [];
    if (props.technicalGoal?.spectrum !== undefined &&
        props.technicalGoal.spectrum.length > 0) {
        initialSpectralWindows = props.technicalGoal.spectrum.map(
            (spectralWindow) => {
                return convertToScienceSpectralWindowGui(spectralWindow);
        })
    }

    // create form.
    const form = useForm<TechnicalGoalValues> (
        {
            initialValues: {
                technicalGoalId: props.technicalGoal?._id, //required for deletion of spectral windows
                performanceParameters:
                    convertToPerformanceParametersGui(props.technicalGoal?.performance!),
                spectralWindows: initialSpectralWindows
            },

            validate: {
                //theNumber: check that if a unit has been selected the numeric component isn't blank
                //theUnit: ensure that if the parameter has a numeric value it also has a unit name
                performanceParameters: {
                    angularResolution:{
                        value: (theNumber, formValues) => (
                            formValues.performanceParameters.angularResolution.unit !== null &&
                            theNumber === "" ?
                                "Unit selected but no value given" : null
                        ),
                        unit:(theUnit, formValues) => (
                            formValues.performanceParameters.angularResolution.value !== "" &&
                            theUnit === null  ?
                                'Please pick a unit' : null
                        )
                    },
                    largestScale:{
                        value: (theNumber, formValues) => (
                            formValues.performanceParameters.largestScale.unit !== null &&
                            theNumber === "" ?
                                "Unit selected but no value given" : null
                        ),
                        unit: (theUnit, formValues) => (
                            formValues.performanceParameters.largestScale.value !== "" &&
                            theUnit === null ?
                                'Please pick a unit' : null
                        )
                    },
                    sensitivity:{
                        value: (theNumber, formValues) => (
                            formValues.performanceParameters.sensitivity.unit !== null &&
                            theNumber === "" ?
                                "Unit selected but no value given" : null
                        ),
                        unit: (theUnit, formValues) => (
                            formValues.performanceParameters.sensitivity.value !== "" &&
                            theUnit === null  ?
                                'Please pick a unit' : null
                        )
                    },
                    dynamicRange:{
                        value: (theNumber, formValues) => (
                            formValues.performanceParameters.dynamicRange.unit !== null &&
                            theNumber === ""?
                                "Unit selected but no value given" : null
                        ),
                        unit: (theUnit, formValues) => (
                            formValues.performanceParameters.dynamicRange.value !== "" &&
                            theUnit === null  ?
                                'Please pick a unit' : null
                        )
                    },
                    //a spectral point must be given
                    spectralPoint:{
                        value: (theNumber) => (
                            theNumber === "" ?
                                "A representative spectral point must be given" :
                                null
                        ),
                        unit:(theUnit, formValues) => (
                            formValues.performanceParameters.spectralPoint.value !== "" &&
                            theUnit === null  ?
                                'Please pick a unit' : null
                        )
                    }
                },
                spectralWindows: {
                    start: {
                        value: (theNumber) => (
                            theNumber === '' ? 'Please specify a start value' :
                                null
                        ),
                        unit: (theUnit) => (
                            theUnit === null  ? 'Please specify a unit' : null
                        )
                    },
                    end: {
                        value: (theNumber) => (
                            theNumber === '' ? 'Please specify an end value' :
                                null
                        ),
                        unit: (theUnit) => (
                            theUnit === null  ? 'Please specify a unit' : null
                        )
                    },
                    spectralResolution: {
                        value: (theNumber) => (
                            theNumber === '' ?
                                'Please specify a resolution value' :
                                null
                        ),
                        unit: (theUnit) => (
                            theUnit === null  ? 'Please specify a unit' : null
                        )
                    },
                    polarization: (value) => (
                        value === null ? 'Please select a polarization' : null
                    )
                }
            }
        }
    )


    const handleSubmit = form.onSubmit((values) => {

        if(newTechnicalGoal) {
            //posting a new technical goal to the DB

            let performanceParameters : PerformanceParameters =
                convertToPerformanceParameters(values.performanceParameters);


            let goal : TechnicalGoal = {
                performance: performanceParameters,
                spectrum: values.spectralWindows.map(
                    (windowGui) => {
                        return convertToScienceSpectralWindow(windowGui);
                    }
                )
            }

            fetchTechnicalGoalResourceAddTechnicalGoal( {
                pathParams: {proposalCode: Number(selectedProposalCode)},
                body: goal
            })
                .then(()=>queryClient.invalidateQueries())
                .then(()=>props.closeModal!())
                .catch(console.error);
        } else {
            //editing an existing technical goal

            if (form.isDirty('performanceParameters')) {
                let performanceParameters : PerformanceParameters =
                    convertToPerformanceParameters(values.performanceParameters);

                fetchTechnicalGoalResourceReplacePerformanceParameters({
                    pathParams: {
                        proposalCode: Number(selectedProposalCode),
                        technicalGoalId: props.technicalGoal?._id!
                    },
                    body: performanceParameters
                })
                    .then(()=>queryClient.invalidateQueries())
                    .then(() =>
                        notifySuccess("Edit successful",
                            "performance parameters updated"))
                    .catch(console.error);
            }

            if (form.isDirty('spectralWindows')) {
                form.values.spectralWindows.map((sw, index) => {
                    if (sw.id === 0) {
                        //new spectral window - add to the TechnicalGoal
                        fetchTechnicalGoalResourceAddSpectrum({
                            pathParams: {
                                proposalCode: Number(selectedProposalCode),
                                technicalGoalId: props.technicalGoal?._id!
                            },
                            body: convertToScienceSpectralWindow(sw)
                        })
                            .then(()=>queryClient.invalidateQueries())
                            .catch(console.error)

                    } else if (form.isDirty(`spectralWindows.${index}`)) {
                        //existing spectral window and modified - update in TechnicalGoal
                        fetchTechnicalGoalResourceReplaceSpectrum({
                            pathParams: {
                                proposalCode: Number(selectedProposalCode),
                                technicalGoalId: props.technicalGoal?._id!,
                                spectralWindowId: sw.id
                            },
                            body: convertToScienceSpectralWindow(sw)
                        })
                            .then(()=>queryClient.invalidateQueries())
                            .catch(console.error)

                    }//else do nothing
                })
            }
        }
    })
    const navigate = useNavigate();
    function handleCancel(event: SyntheticEvent) {
        event.preventDefault();
        navigate("../",{relative:"path"})
        }

    return (
        <form onSubmit={handleSubmit}>
            <ContextualHelpButton messageId="MaintTechGoal" />
        <Stack>
            <Grid columns={TOTAL_COLUMNS}>
                <Grid.Col span={{base: TOTAL_COLUMNS, md: PERFORMANCE_COLUMNS}}>
                    <PerformanceParametersSection form={form}/>
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS, md: SPECTRUM_COLUMNS}}>
                    <SpectralWindowsSection form={form}/>
                    <p> </p>
                    <Grid>
                    <Grid.Col span={8}></Grid.Col>
                       <FormSubmitButton form={form} />
                       <CancelButton
                          onClickEvent={handleCancel}
                           toolTipLabel={"Go back without saving"}/>
                     </Grid>
                     <p> </p>
                </Grid.Col>
                </Grid>
        </Stack>
        </form>
    )
}


