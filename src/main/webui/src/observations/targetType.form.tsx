import {
    useProposalResourceGetTargets, useTechnicalGoalResourceGetTechnicalGoals,
} from "../generated/proposalToolComponents.ts";
import {
    Container,
    Select,
    Space
} from "@mantine/core";
import {useParams} from "react-router-dom";
import { ReactElement } from 'react';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group.tsx';
import { JSON_SPACES, NO_ROW_SELECTED } from '../constants.tsx';
import { TargetTable } from '../targets/TargetTable.tsx';
import { TechnicalGoalsTable } from '../technicalGoals/technicalGoalTable.tsx';

/**
 * the entrance to building the target part of the edit panel.
 *
 * @param {any} form the form that governs the entire observation edit.
 * @return {ReactElement} the HTML for the observation edit panel.
 * @constructor
 */
export default function TargetTypeForm (
        form: UseFormReturnType<ObservationFormValues>): ReactElement {
    const { selectedProposalCode} = useParams();

    const {
        data: targets ,
        error: targetListError,
        isLoading: targetsLoading } =
            useProposalResourceGetTargets({
                pathParams: {proposalCode: Number(selectedProposalCode)}},
                {enabled: true}
            );

    const {
        data: technicalGoals,
        error: technicalGoalsError,
        isLoading: technicalGoalsLoading} =
            useTechnicalGoalResourceGetTechnicalGoals( {
                pathParams: {proposalCode: Number(selectedProposalCode)}
            });

    /**
     * generates the html for the observation type.
     * @return {ReactElement} the html for the observation type.
     * @constructor
     */
    function SelectObservationType(): ReactElement {
        return (
            <Select
                label={"Observation Type: "}
                placeholder={"Select observation type"}
                data = {[
                    'Target', 'Calibration'
                ]}
                {...form.getInputProps('observationType')}
            />
        )
    }

    /**
     * generates the html for the calibration use element.
     * @return {ReactElement} the html for the calibration element.
     * @constructor
     */
    function SelectCalibrationUse(): ReactElement
    {
        return (
            <Select
                label={"Calibration intended use: "}
                placeholder={"pick one"}
                maxDropdownHeight={150}
                data = {[
                    {value: 'AMPLITUDE', label: 'Amplitude'},
                    {value: 'ATMOSPHERIC', label: 'Atmospheric'},
                    {value: 'BANDPASS', label: 'Bandpass'},
                    {value: 'PHASE', label: 'Phase'},
                    {value: 'POINTING', label: 'Pointing'},
                    {value: 'FOCUS', label: 'Focus'},
                    {value: 'POLARIZATION', label: 'Polarization'},
                    {value: 'DELAY', label: 'Delay'},
                ]}
                {...form.getInputProps('calibrationUse')}
            />
        )
    }

    // handle any errors.
    if (targetListError) {
        return (
            <div>
                    <pre>
                        {JSON.stringify(targetListError, null, JSON_SPACES)}
                    </pre>
            </div>
        )
    }
    if (technicalGoalsError) {
        return (
            <div>
                    <pre>{JSON.stringify(
                        technicalGoalsError, null, JSON_SPACES)}
                    </pre>
            </div>
        )
    }

    // return the html for the tables.
    return (
        <Container fluid>
            <h3>Please select a target.</h3>
            {
                targetsLoading ? 'loading...' :
                    <TargetTable
                        selectedProposalCode={selectedProposalCode}
                        data={targets}
                        showButtons={false}
                        isLoading={false}
                        boundTargets={[]}
                        selectedTarget={
                        form.values.targetDBId != undefined ?
                            form.values.targetDBId :
                            NO_ROW_SELECTED}
                        setSelectedTarget={(value: number) => {
                            form.setFieldValue('targetDBId', value);
                        }}
                    />
            }

            <br/>

            <h3>Please select a Technical Goal.</h3>
            {
                technicalGoalsLoading ? 'loading...' :
                    <TechnicalGoalsTable
                        goals={technicalGoals}
                        boundTechnicalGoalIds={[]}
                        showButtons={false}
                        selectedTechnicalGoal={
                            form.values.techGoalId != undefined ?
                                form.values.techGoalId :
                                NO_ROW_SELECTED}
                        setSelectedTechnicalGoal={(value: number) => {
                            form.setFieldValue('techGoalId', value);
                        }}
                        />
            }
            <Space h={"xl"}/>
            {SelectObservationType()}
            {form.values.observationType === 'Calibration' &&
                SelectCalibrationUse()
            }
        </Container>
    );
}