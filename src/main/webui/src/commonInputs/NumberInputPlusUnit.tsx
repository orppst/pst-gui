import {Grid, MantineColor, MantineSpacing, NumberInput, Select, StyleProp, Tooltip} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {notSpecified} from "../technicalGoals/edit.group.tsx";

export interface NumberInputPlusUnitProps {
    color?: StyleProp<MantineColor>
    gap?: StyleProp<MantineSpacing>
    padding?: StyleProp<MantineSpacing>
    form: UseFormReturnType<any>
    label: string
    toolTip?: string,
    valueRoot: string
    units: {value: string, label: string}[]
}



export function NumberInputPlusUnit(props: NumberInputPlusUnitProps) {
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
                        decimalScale={3}
                        hideControls
                        step={0.1}
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
                    data={props.units}
                    {...props.form.getInputProps(props.valueRoot + ".unit.value")}
                />
            </Grid.Col>
        </Grid>
    )
}