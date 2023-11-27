import {Grid, MantineColor, MantineSpacing, NumberInput, Select, StyleProp, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {notSpecified} from "../technicalGoals/edit.group.tsx";
import { ReactElement } from 'react';
import { DEFAULT_DECIMAL_PLACE, MAX_COLUMNS } from '../constants.tsx';
import {RealQuantity} from "../generated/proposalToolSchemas.ts";


/**
 * Type to use with the Mantine 'NumberInput' element embedded in
 * NumberInputPlusUnit function. The Mantine NumberInput requires a
 * number | string type where a "null" number is given by the empty string.
 * The 'unit' member is used in a 'Select' element, which requires 'null'
 * when there is no unit rather than the empty string - confusing much?
 */
export type NumberUnitType =  {
    value: number | string,
    unit: string | null
}

/**
 * convert NumberUnitType to RealQuantity
 *
 * @param {NumberUnitType} input type used with NumberInput on forms including a Select for the unit name
 * @return {RealQuantity} type contained in the database representing a numeric value and a unit
 * intention: use before saving a "RealQuantity" to the database
 */
export const convertToRealQuantity = (input: NumberUnitType) : RealQuantity =>
{
    return (
        {
            "@type": "ivoa:RealQuantity",
            value: input.value as number,
            unit: {value: input.unit as string}
        }
    )
}

/**
 *  convert RealQuantity to NumberUnitType
 *
 * @param input {RealQuantity} potentially undefined if a value doesn't exist when read from the database
 * @return {NumberUnitType} type to use with the forms
 *  intention: use after reading a "RealQuantity" from the database which is potentially undefined
 */
export const convertToNumberUnitType = (input: RealQuantity | undefined) : NumberUnitType =>
{
    return (
        {
            value: input?.value ?? '',
            unit: input?.unit?.value ?? null
        }
    )
}

/**
 * prop for the number input with unit.
 *
 * @param {StyleProp<MantineColor>} color the text color.
 * @param {StyleProp<MantineSpacing>} gap the space between number value and unit.
 * @param {StyleProp<MantineSpacing>} padding
 * @param {number} decimalPlaces the number of decimal places to display.
 * @param {number} step the quantity that will be incremented up or down.
 * @param {UseFormReturnType<any>} form the form that contains this input with unit.
 * @param {string} label the label for the input.
 * @param {boolean} withAsterisk if true puts an asterisk next to the input label.
 * @param {string} toolTip the text shown when hovering over the input.
 * @param {string} valueRoot
 * @param {value: string, label: string[]} the unit values and labels.
 */
export interface NumberInputPlusUnitProps {
    color?: StyleProp<MantineColor>
    gap?: StyleProp<MantineSpacing>
    padding?: StyleProp<MantineSpacing>
    decimalPlaces?: number
    step?: number
    form: UseFormReturnType<any>
    label: string
    withAsterisk?: boolean
    toolTip?: string
    valueRoot: string
    units: {value: string, label: string}[]
}

/**
 *
 * @param {NumberInputPlusUnitProps} props the data related to this number
 * input with unit.
 * @return {ReactElement} the html that represents a number input plus unit.
 * @constructor
 */
export function NumberInputPlusUnit(
    props: NumberInputPlusUnitProps): ReactElement {
    const totalCols = MAX_COLUMNS;
    const baseCols = totalCols / 2;

    return (
        <Grid columns={totalCols} gutter={props.gap}>
            <Grid.Col span={{base: baseCols, sm: 7}}>
                <Tooltip
                    disabled={props.toolTip == undefined}
                    label={props.toolTip}>

                    <NumberInput
                        bg={props.color}
                        label={props.label + ":"}
                        p={props.padding}
                        placeholder={notSpecified}
                        withAsterisk={props.withAsterisk}
                        decimalScale={
                            props.decimalPlaces ?? DEFAULT_DECIMAL_PLACE}
                        hideControls
                        step={props.step ?? 0.1}
                        min={0}
                        {...props.form.getInputProps(
                            props.valueRoot + ".value" )}
                    />
                </Tooltip>
            </Grid.Col>
            <Grid.Col span={{base: baseCols, sm: 5}}>
                <Select
                    bg={props.color}
                    label={"unit:"}
                    p={props.padding}
                    placeholder={"pick one"}
                    withAsterisk={props.withAsterisk}
                    allowDeselect
                    data={props.units}
                    {...props.form.getInputProps(props.valueRoot + ".unit")}
                />
            </Grid.Col>
        </Grid>
    )
}