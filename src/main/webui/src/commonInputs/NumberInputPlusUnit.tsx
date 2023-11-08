import {Grid, MantineColor, MantineSpacing, NumberInput, Select, StyleProp, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {notSpecified} from "../technicalGoals/edit.group.tsx";
import { ReactElement } from 'react';
import {RealQuantity} from "../generated/proposalToolSchemas.ts";


/**
 * Type to use with the Mantine 'NumberInput' element embedded in NumberInputPlusUnit function.
 * The Mantine NumberInput requires a number | string type where a "null" number is given by
 * the empty string.
 */
export type NumberUnitType =  {
    value: number | string,
    unit: string
}

/**
 * convert NumberUnitType to RealQuantity
 *
 * intention: use before saving a "RealQuantity" to the database
 */
export const convertToRealQuantity = (input: NumberUnitType) : RealQuantity =>
{
    return (
        {
            "@type": "ivoa:RealQuantity",
            value: input.value as number,
            unit: {value: input.unit}
        }
    )
}

/**
 *  convert RealQuantity to NumberUnitType
 *
 *  intention: use after reading a "RealQuantity" from the database which is potentially undefined
 */
export const convertToNumberUnitType = (input: RealQuantity | undefined) : NumberUnitType =>
{
    return (
        {
            value: input?.value ?? '',
            unit: input?.unit?.value ?? ''
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
    toolTip?: string,
    valueRoot: string
    units: {value: string, label: string}[]
}

/**
 *
 * @param {NumberInputPlusUnitProps} props the data related to this number input with unit.
 * @return {ReactElement} the html that represents a number input plus unit.
 * @constructor
 */
export function NumberInputPlusUnit(props: NumberInputPlusUnitProps): ReactElement {
    const totalCols = 12;
    const baseCols = totalCols / 2;

    return (
        <Grid columns={totalCols} gutter={props.gap}>
            <Grid.Col span={{base: baseCols, sm: 7}}>
                <Tooltip disabled={props.toolTip == undefined} label={props.toolTip}>
                    <NumberInput
                        bg={props.color + ".7"}
                        label={props.label + ":"}
                        p={props.padding}
                        placeholder={notSpecified}
                        decimalScale={props.decimalPlaces ?? 3}
                        hideControls
                        step={props.step ?? 0.1}
                        min={0}
                        {...props.form.getInputProps(props.valueRoot + ".value" )}
                    />
                </Tooltip>
            </Grid.Col>
            <Grid.Col span={{base: baseCols, sm: 5}}>
                <Select
                    bg={props.color + ".7"}
                    label={"unit:"}
                    p={props.padding}
                    placeholder={"pick a unit"}
                    allowDeselect
                    data={props.units}
                    {...props.form.getInputProps(props.valueRoot + ".unit")}
                />
            </Grid.Col>
        </Grid>
    )
}