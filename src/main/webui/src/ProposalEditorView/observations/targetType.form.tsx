import {
    fetchProposalResourceGetFields,
    useProposalResourceGetTargets, useTechnicalGoalResourceGetTechnicalGoals,
} from "src/generated/proposalToolComponents.ts";
import {
    Container,
    Select,
    Space,
    Table,
    Tooltip, useMantineTheme
} from '@mantine/core';
import {useParams} from "react-router-dom";
import {ReactElement, useEffect, useState} from 'react';
import { UseFormReturnType } from '@mantine/form';
import { ObservationFormValues } from './edit.group.tsx';
import {
    OPEN_DELAY,
    NO_ROW_SELECTED, TABLE_MIN_WIDTH,
    TABLE_SCROLL_HEIGHT, ERROR_YELLOW
} from 'src/constants.tsx';
import { TargetTable } from '../targets/TargetTable.tsx';
import { TechnicalGoalsTable } from '../technicalGoals/technicalGoalTable.tsx';
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {ObjectIdentifier} from "../../generated/proposalToolSchemas.ts";

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
    const theme = useMantineTheme();

    const [fieldsData, setFieldsData]
        = useState<{value: string, label: string}[]>([])

    const {
        data: targets,
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

    useEffect(() => {
        fetchProposalResourceGetFields({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        })
            .then((data: ObjectIdentifier[]) => {
                setFieldsData(
                    data?.map(field => (
                        {value: String(field.dbid!), label: field.name!}
                    ))
                )
            })
            .catch(error => {console.error(error); notifyError("Error loading fields",
                "cause: " + getErrorMessage(error))}
            )
    }, []);

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
                    label={"Observation Type: "}
                    placeholder={"Select observation type"}
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
                    'Amplitude',
                    'Atmospheric',
                    'Bandpass',
                    'Phase',
                    'Pointing',
                    'Focus',
                    'Polarization',
                    'Delay',
                ]}
                {...form.getInputProps('calibrationUse')}
            />
        )
    }

    if (targetListError) {
        notifyError("Error loading targets",
            "cause: " + getErrorMessage(targetListError));
    }
    if (technicalGoalsError) {
        notifyError("Error loading technical goals",
            "cause: " + getErrorMessage(technicalGoalsError));
    }

    // return the html for the tables.
    return (
        <Container fluid>
            {/* only present the message about selecting a target
            when not selected */}
            {form.values.targetDBIds === undefined ||
                    form.values.targetDBIds.length == 0
                ? <p style={{color:theme.colors.yellow[ERROR_YELLOW]}}>
                    Please select a target.
                  </p>
                : <></>}

            {
                targetsLoading ? 'loading...' :
                    <Table.ScrollContainer h={TABLE_SCROLL_HEIGHT}
                                           minWidth={TABLE_MIN_WIDTH}>
                        <TargetTable
                            selectedProposalCode={selectedProposalCode}
                            data={targets}
                            showButtons={false}
                            isLoading={false}
                            boundTargets={[]}
                            selectedTargets={form.values.targetDBIds}
                            setSelectedTargetFunction={(value: number) => {
                                const index = form.values.targetDBIds?.indexOf(value);
                                if(index === undefined || index == -1) {
                                    if(form.values.targetDBIds == undefined) {
                                        form.setFieldValue('targetDBId', [value]);
                                    } else {
                                        let newTargets = form.values.targetDBIds;
                                        newTargets.push(value);
                                        form.setFieldValue('targetDBId', newTargets);
                                        form.values.targetDBIds = newTargets;
                                        //Or can I simply do this?
                                        //form.values.targetDBIds.push(value);
                                    }
                                } else {
                                    form.values.targetDBIds?.splice(index, 1);
                                }
                            }}
                        />
                    </Table.ScrollContainer>
            }

            <Space h={"sm"}/>

            {/* only present the message about selecting a technical
            when not selected */}
            {form.values.techGoalId === undefined ||
            form.values.techGoalId === NO_ROW_SELECTED
                ? <p style={{color:theme.colors.yellow[ERROR_YELLOW]}}>
                    Please select a Technical Goal.
                  </p>
                : <></>}

            {
                technicalGoalsLoading ? 'loading...' :
                    <Table.ScrollContainer h={TABLE_SCROLL_HEIGHT}
                                           minWidth={TABLE_MIN_WIDTH}>
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
                    </Table.ScrollContainer>
            }

            <Select
                label={"Select an Observation field"}
                placeholder={"pick one"}
                data={fieldsData}
                {...form.getInputProps('fieldId')}
            />

            <Space h={"xl"}/>
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