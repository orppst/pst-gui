import {
    useProposalResourceGetTargets,
    useTechnicalGoalResourceGetTechnicalGoals,
} from "src/generated/proposalToolComponents.ts";
import {
    Box,
    Fieldset,
    Group, Loader,
    Select, Stack,
    Table,
    Text,
    Tooltip,
} from '@mantine/core';
import {useParams} from "react-router-dom";
import {Dispatch, ReactElement, SetStateAction} from 'react';
import { UseFormReturnType } from '@mantine/form';
import {
    OPEN_DELAY,
    NO_ROW_SELECTED, TABLE_MIN_WIDTH,
    TABLE_SCROLL_HEIGHT, err_red_str, err_yellow_str, err_green_str,
} from 'src/constants.tsx';
import { TargetTable } from '../../targets/TargetTable.tsx';
import {notifyError} from "../../../commonPanel/notifications.tsx";
import getErrorMessage from "../../../errorHandling/getErrorMessage.tsx";
import {ObservationFormValues} from "../types/ObservationFormInterface";
import {TechnicalGoalsTable} from "../../technicalGoals/technicalGoalTable";

export default function TargetTypeOpticalForm (p: {
    form: UseFormReturnType<ObservationFormValues>,
    setFieldName: Dispatch<SetStateAction<string>>
}): ReactElement {
    const { selectedProposalCode} = useParams();

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

    /**
     * generates the html for the observation type. Notice, disabled if editing
     * an existing observation
     * @return {ReactElement} the html for the observation type.
     *
     */
    function SelectObservationType(): ReactElement {
        return (
            <Tooltip
                label={p.form.getValues().observationId !== undefined ?
                    "Cannot change the type of an existing Observation" :
                    'Target object or Calibration object'}
                openDelay={OPEN_DELAY}
            >
                <Select
                    label={"Type: "}
                    placeholder={"Select observation type"}
                    disabled={p.form.getValues().observationId !== undefined}
                    data = {[
                        'Target', 'Calibration'
                    ]}
                    {...p.form.getInputProps('observationType')}
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
        const calibrationSelected =
            p.form.getValues().observationType === "Calibration";
        return (
            <Select
                label={"Calibration intended use: "}
                disabled={!calibrationSelected}
                placeholder={calibrationSelected ? "pick one" : "for Calibration type only"}
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
                {...p.form.getInputProps('calibrationUse')}
            />
        )
    }

    if (targetsLoading || technicalGoalsLoading) {
        return (
            <Box m={"20%"}>
                <Loader />
            </Box>
        )
    }

    if (targetListError) {
        notifyError("Error loading targets",
            getErrorMessage(targetListError));
    }
    if (technicalGoalsError) {
        notifyError("Error loading technical goals",
            getErrorMessage(technicalGoalsError));
    }

    return (
        <Stack>
            <Fieldset legend={"Observation Type"}>
                <Group grow>
                    {SelectObservationType()}
                    {SelectCalibrationUse()}
                </Group>
            </Fieldset>
            <Fieldset legend={"Target(s)"}>
                <Text size={"sm"}>
                    {
                        p.form.getValues().targetDBIds.length == 0 ?
                            <Text c={err_red_str} span inherit>Please select at least one</Text>
                            :
                            <Text c={err_green_str} span inherit>Multiple selections allowed</Text>
                    }
                </Text>
                {
                    <Table.ScrollContainer
                        h={targets?.length &&  targets.length < 5 ? 100 : TABLE_SCROLL_HEIGHT}
                        minWidth={TABLE_MIN_WIDTH}
                    >
                        <TargetTable
                            selectedProposalCode={selectedProposalCode}
                            data={targets}
                            showButtons={false}
                            isLoading={false}
                            boundTargets={[]}
                            borderColor={p.form.getValues().targetDBIds.length === 0 ?
                                err_yellow_str : undefined}
                            selectedTargets={p.form.getValues().targetDBIds}
                            setSelectedTargetFunction={(value: number) => {
                                const index = p.form.getValues().targetDBIds.indexOf(value);
                                if(index == -1) {
                                    //user is selecting a target
                                    p.form.insertListItem('targetDBIds', value)
                                    //set fieldName to latest target selected
                                    p.setFieldName(targets?.find(t =>
                                        t.dbid === value)?.name!)
                                } else {
                                    //user is deselecting a target
                                    p.form.removeListItem('targetDBIds', index)
                                    if (p.form.getValues().targetDBIds.length !== 0) {
                                        //set field name to first remaining in list
                                        p.setFieldName(targets?.find(t =>
                                            t.dbid === p.form.getValues().targetDBIds.at(0))?.name!
                                        )
                                    } else {
                                        //zero targets selected, clear the field name
                                        p.setFieldName("")
                                    }
                                }
                            }}
                        />
                    </Table.ScrollContainer>
                }
            </Fieldset>
            <Fieldset legend={"Technical Goal"}>
                <Text size={"sm"}>
                    { p.form.getValues().techGoalId === NO_ROW_SELECTED ?
                        <Text c={err_red_str} span inherit>Please select one</Text>
                        :
                        <Text c={err_green_str} span inherit>Selected</Text>
                    }
                </Text>
                {
                    <Table.ScrollContainer
                        h={technicalGoals?.length &&  technicalGoals.length < 5 ?
                            100 : TABLE_SCROLL_HEIGHT}
                        minWidth={TABLE_MIN_WIDTH}
                    >
                        <TechnicalGoalsTable
                            goals={technicalGoals}
                            boundTechnicalGoalIds={[]}
                            showButtons={false}
                            selectedTechnicalGoal={p.form.getValues().techGoalId}
                            setSelectedTechnicalGoal={(value: number) => {
                                p.form.setFieldValue('techGoalId', value);
                            }}
                            borderColor={p.form.getValues().techGoalId === NO_ROW_SELECTED ?
                                err_yellow_str : undefined}
                        />
                    </Table.ScrollContainer>
                }
            </Fieldset>
        </Stack>
    );
}