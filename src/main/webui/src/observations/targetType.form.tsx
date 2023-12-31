import {
    useProposalResourceGetTargets, useTechnicalGoalResourceGetTechnicalGoals,
} from "../generated/proposalToolComponents.ts";
import {
    Container,
    Select,
    Space, Tooltip
} from "@mantine/core";
import {useParams} from "react-router-dom";
import {RenderTarget} from "../targets/RenderTarget.tsx";
import {RenderTechnicalGoal} from "../technicalGoals/render.technicalGoal.tsx";
import { ReactElement } from 'react';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group.tsx';
import {JSON_SPACES, OPEN_DELAY} from '../constants.tsx';
import { randomId } from '@mantine/hooks';

/**
 * the entrance to building the target part of the edit panel.
 *
 * @param {UseFormReturnType<ObservationFormValues>} form the form that governs
 * the entire observation edit.
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
     * produces the HTML for the select targets.
     *
     * @return {ReactElement} the html for the select targets.
     * @constructor
     */
    function SelectTargets(): ReactElement {
        if (targetListError) {
            return (
                <div>
                    <pre>{JSON.stringify(targetListError, null, JSON_SPACES)}</pre>
                </div>
            )
        }

        let selectTargets = targets?.map((target) => {
            return {
                value: target.dbid!.toString(),
                label: target.name!
            }
        })

        return (
            <>
                {selectTargets ?
                    <Select
                        label={"Observation target: "}
                        placeholder={"pick one"}
                        searchable
                        data={selectTargets}
                        {...form.getInputProps('targetDBId')}
                    /> : null
                }
            </>
        )
    }

    /**
     * generates the html for a technical goal.
     *
     * @return {ReactElement} the html for the technical goal.
     * @constructor
     */
    function SelectTechnicalGoal(): ReactElement {
        if (technicalGoalsError) {
            return (
                <div>
                    <pre>{JSON.stringify(
                        technicalGoalsError, null, JSON_SPACES)}
                    </pre>
                </div>
            )
        }

        let selectTechGoals = technicalGoals?.map((goal) => {
            return {
                value: goal.dbid!.toString(),
                //note: for TechnicalGoals name is equivalent to dbid
                label: goal.name!
            }
        })

        return (
            <>
                { selectTechGoals ?
                    <Select
                        label={"Technical Goal:"}
                        placeholder={"pick one"}
                        data={selectTechGoals}
                        {...form.getInputProps('techGoalId')}
                    /> : null
                }
            </>
        )
    }

    /**
     * generates the html for the observation type. Notice, disabled if editing
     * an existing observation
     * @return {ReactElement} the html for the observation type.
     *
     */
    function SelectObservationType(): ReactElement {
        return (
            <Tooltip
                label={form.values.observationId !== undefined ?
                    "Cannot change the type of an existing Observation" :
                    'Target object or Calibration object'}
                openDelay={OPEN_DELAY}
            >
                <Select
                    label={"Observation type: "}
                    placeholder={"select observation type"}
                    disabled={form.values.observationId !== undefined}
                    data = {[
                        'Target', 'Calibration'
                    ]}
                    {...form.getInputProps('observationType')}
                />
            </Tooltip>
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


    return (
        <Container fluid>
            {SelectTargets()}
            {
                targetsLoading ? 'loading...' :
                    form.values.targetDBId != undefined &&
                    <RenderTarget
                        proposalCode={Number(selectedProposalCode)}
                        dbid={form.values.targetDBId}
                        showRemove={false}
                        key={randomId()}
                        boundTargets={[]}
                    />
            }
            <Space h={"sm"}/>
            {SelectTechnicalGoal()}
            {
                technicalGoalsLoading ? 'loading...' :
                    form.values.techGoalId != undefined &&
                    <RenderTechnicalGoal
                        proposalCode={Number(selectedProposalCode)}
                        dbid={form.values.techGoalId}
                    />
            }
            <Space h={"sm"}/>
            {SelectObservationType()}
            {form.values.observationType === 'Calibration' &&
                <>
                    <Space h={"xs"}/>
                    {SelectCalibrationUse()}
                </>
            }
        </Container>
    );
}