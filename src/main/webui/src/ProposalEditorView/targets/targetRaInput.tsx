import {ReactElement} from "react";
import {NumberInput, Text} from "@mantine/core";
import {AstroLib} from "@tsastro/astrolib";
import {UseFormReturnType} from "@mantine/form";
import {Aladin, NewTargetFormValues} from "./New.tsx";

export default
function TargetRaInput(p: {
    form: UseFormReturnType<NewTargetFormValues>
}) : ReactElement {

    return (
        <>
            <NumberInput
                hideControls
                label={"RA"}
                decimalScale={6}
                min={0}
                max={360}
                clampBehavior={"strict"}
                allowNegative={false}
                suffix="°"
                {...p.form.getInputProps("ra.degrees")}
                onChange={(e) => {
                    if (p.form.getInputProps("ra.degrees").onChange) {
                        p.form.getInputProps("ra.degrees").onChange(e);
                    }
                    //update the Aladdin viewport
                    Aladin.gotoRaDec(e as number, p.form.getValues().dec.degrees);
                }}
            />
            <Text
                size={"xs"}
                c={"gray.6"}
                style={{margin: "-4px 0px 0px 12px"}}
            >
                {AstroLib.DegToHms(p.form.getValues().ra.degrees,3)}
            </Text>
        </>
    )
}