import {
    useProposalResourceGetTargets,
    useTechnicalGoalResourceGetTechnicalGoals,
} from "src/generated/proposalToolComponents.ts";
import {
    Container,
    Select,
    Space,
    Table,
    Tooltip, useMantineTheme
} from '@mantine/core';
import {useParams} from "react-router-dom";
import {Dispatch, ReactElement, SetStateAction} from 'react';
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


export default function TargetTypeForm (p: {
    form: UseFormReturnType<ObservationFormValues>,
    setFieldName: Dispatch<SetStateAction<string>>
}): ReactElement {
    const { selectedProposalCode} = useParams();
    const theme = useMantineTheme();

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
                    label={"Observation Type: "}
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
                {...p.form.getInputProps('calibrationUse')}
            />
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
        <Container fluid>
            {
                p.form.getValues().targetDBIds.length == 0 ?
                    <p style={{color:theme.colors.yellow[ERROR_YELLOW]}}>
                        Please select a target.
                    </p>
                    :
                    <></>
            }
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
                            selectedTargets={p.form.getValues().targetDBIds}
                            setSelectedTargetFunction={(value: number) => {
                                const index = p.form.getValues().targetDBIds.indexOf(value);
                                if(index == -1) {
                                    //user is selecting a target
                                    p.form.insertListItem('targetDBIds', value)
                                    //set fieldName to latest target selected
                                    p.setFieldName(
                                        targets?.find(t => t.dbid === value)?.name!
                                    )
                                } else {
                                    //user is deselecting a target
                                    p.form.removeListItem('targetDBIds', index)
                                    if (p.form.getValues().targetDBIds.length !== 0) {
                                        //set field name to first remaining in list
                                        p.setFieldName(
                                            targets?.find(t =>
                                                t.dbid === p.form.getValues().targetDBIds.at(0)
                                            )?.name!
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

            <Space h={"sm"}/>

            {
                p.form.getValues().techGoalId === undefined ||
                p.form.getValues().techGoalId === NO_ROW_SELECTED ?
                    <p style={{color:theme.colors.yellow[ERROR_YELLOW]}}>
                        Please select a Technical Goal.
                    </p>
                    :
                    <></>
            }

            {
                technicalGoalsLoading ? 'loading...' :
                    <Table.ScrollContainer h={TABLE_SCROLL_HEIGHT}
                                           minWidth={TABLE_MIN_WIDTH}>
                        <TechnicalGoalsTable
                            goals={technicalGoals}
                            boundTechnicalGoalIds={[]}
                            showButtons={false}
                            selectedTechnicalGoal={
                                p.form.getValues().techGoalId != undefined ?
                                    p.form.getValues().techGoalId :
                                    NO_ROW_SELECTED}
                            setSelectedTechnicalGoal={(value: number) => {
                                p.form.setFieldValue('techGoalId', value);
                            }}
                        />
                    </Table.ScrollContainer>
            }

            <Space h={"xl"}/>
            {SelectObservationType()}
            {
                p.form.getValues().observationType === 'Calibration' &&
                    <>
                        <Space h={"xs"}/>
                        {SelectCalibrationUse()}
                    </>
            }
        </Container>
    );
}