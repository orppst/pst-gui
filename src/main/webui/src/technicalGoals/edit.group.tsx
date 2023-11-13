import PerformanceParametersSection from "./performance.form.tsx";
import SpectralWindowsSection from "./spectrum.form.tsx";
import {Grid} from "@mantine/core";
import {TechnicalGoalProps} from "./technicalGoalsPanel.tsx";
import { ReactElement } from 'react';
import {convertToNumberUnitType, convertToRealQuantity, NumberUnitType} from "../commonInputs/NumberInputPlusUnit.tsx";
import {useParams} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {
    convertToScienceSpectralWindowGui,
    ScienceSpectralWindowGui
} from "./scienceSpectralWindowGui.tsx";
import {useForm} from "@mantine/form";
import {PerformanceParameters, TechnicalGoal} from "../generated/proposalToolSchemas.ts";
import {
    fetchTechnicalGoalResourceAddTechnicalGoal,
    fetchTechnicalGoalResourceReplacePerformanceParameters
} from "../generated/proposalToolComponents.ts";
import {notifications} from "@mantine/notifications";
import {SubmitButton} from "../commonButtons/save.tsx";

export const notSpecified = "not specified";
export const notSet = "not set";

/**
 * interface for the TechnicalGoal Form values.
 * @param {NumberUnitType} angularResolution the desired angular resolution for the observation
 * @param {NumberUnitType} largestScale the desired largest scale for the observation
 * @param {NumberUnitType} sensitivity the desired sensitivity for the observation
 * @param {NumberUnitType} dynamicRange the desired dynamic range for the observation
 * @param {NumberUnitType} spectralPoint the representative spectral point of the observation
 * @param {ScienceSpectralWindowGui[]} spectralWindows array of spectral windows on which to focus for the observation
 */
export interface TechnicalGoalValues {
    angularResolution: NumberUnitType,
    largestScale: NumberUnitType,
    sensitivity: NumberUnitType,
    dynamicRange: NumberUnitType,
    spectralPoint: NumberUnitType
    spectralWindows: ScienceSpectralWindowGui []
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
                angularResolution: convertToNumberUnitType(
                    props.technicalGoal?.performance?.desiredAngularResolution
                ),
                largestScale: convertToNumberUnitType(
                    props.technicalGoal?.performance?.desiredLargestScale
                ),
                sensitivity: convertToNumberUnitType(
                    props.technicalGoal?.performance?.desiredSensitivity
                ),
                dynamicRange: convertToNumberUnitType(
                    props.technicalGoal?.performance?.desiredDynamicRange
                ),
                spectralPoint: convertToNumberUnitType(
                    props.technicalGoal?.performance?.representativeSpectralPoint
                ),
                spectralWindows: initialSpectralWindows
            },

            validate: {
                //theNumber: check that if a unit has been selected the numeric
                // component isn't blank
                //theUnit: ensure that if the parameter has a numeric value it
                // also has a unit name
                angularResolution:{
                    value: (theNumber, formValues) => (
                        formValues.angularResolution.unit !== null &&
                        theNumber === "" ?
                            "Unit selected but no value given" : null
                    ),
                    unit:(theUnit, formValues) => (
                        formValues.angularResolution.value !== "" &&
                        theUnit === null  ?
                            'Please pick a unit' : null
                    )
                },
                largestScale:{
                    value: (theNumber, formValues) => (
                        formValues.largestScale.unit !== null &&
                        theNumber === "" ?
                            "Unit selected but no value given" : null
                    ),
                    unit: (theUnit, formValues) => (
                        formValues.largestScale.value !== "" &&
                        theUnit === null ?
                            'Please pick a unit' : null
                    )
                },
                sensitivity:{
                    value: (theNumber, formValues) => (
                        formValues.sensitivity.unit !== null &&
                        theNumber === "" ?
                            "Unit selected but no value given" : null
                    ),
                    unit: (theUnit, formValues) => (
                        formValues.sensitivity.value !== "" &&
                        theUnit === null  ?
                            'Please pick a unit' : null
                    )
                },
                dynamicRange:{
                    value: (theNumber, formValues) => (
                        formValues.dynamicRange.unit !== null &&
                        theNumber === ""?
                            "Unit selected but no value given" : null
                    ),
                    unit: (theUnit, formValues) => (
                        formValues.dynamicRange.value !== "" &&
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
                        formValues.spectralPoint.value !== "" &&
                        theUnit === null  ?
                            'Please pick a unit' : null
                    )
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

    /**
     * handles the submission.
     *
     * @type {(event?: React.FormEvent<HTMLFormElement>) => void} the new values.
     */
    const handleSubmit = form.onSubmit((values) => {
        console.log(values);

        let performanceParameters : PerformanceParameters = {
            desiredAngularResolution: convertToRealQuantity(
                values.angularResolution),
            desiredDynamicRange: convertToRealQuantity(values.dynamicRange),
            desiredSensitivity: convertToRealQuantity(values.sensitivity),
            desiredLargestScale: convertToRealQuantity(values.largestScale),
            representativeSpectralPoint: convertToRealQuantity(
                values.spectralPoint)
        }

        if(newTechnicalGoal) {
            //posting a new technical goal to the DB
            let goal : TechnicalGoal = {
                performance: performanceParameters,
                spectrum: [] //TODO: implement saving spectral windows, see issue #12
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
            fetchTechnicalGoalResourceReplacePerformanceParameters({
                pathParams: {
                    proposalCode: Number(selectedProposalCode),
                    technicalGoalId: props.technicalGoal?._id!
                },
                body: performanceParameters
            })
                .then(()=>queryClient.invalidateQueries())
                .then(() => {
                    notifications.show({
                        autoClose: false,
                        title: "Edit successful",
                        message: "performance parameters updated only, " +
                            "spectral window updates yet to be implemented",
                        color: "green"
                    })
                })
                .then(() => form.resetDirty())
                .catch(console.error);

            //TODO: implement editing existing spectral windows and/or adding
            // new windows, issue #12
        }
    })

    return (
        <form onSubmit={handleSubmit}>
            <SubmitButton
                toolTipLabel={"save technical goal"}
                disabled={!form.isDirty() || !form.isValid()}
            />
            <Grid columns={TOTAL_COLUMNS}>
                <Grid.Col span={{base: TOTAL_COLUMNS, md: PERFORMANCE_COLUMNS}}>
                    <PerformanceParametersSection {...form}/>
                </Grid.Col>
                <Grid.Col span={{base: TOTAL_COLUMNS, md: SPECTRUM_COLUMNS}}>
                    <SpectralWindowsSection {...form}/>
                </Grid.Col>
            </Grid>
        </form>
    )
}