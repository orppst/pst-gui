import {UseFormReturnType} from "@mantine/form";
import {Aladin, NewTargetFormValues} from "./New.tsx";
import {ReactElement} from "react";
import {NumberInput, Text} from "@mantine/core";
import {AstroLib} from "@tsastro/astrolib";

export default
function TargetDecInput(p: {
    form: UseFormReturnType<NewTargetFormValues>;
}) : ReactElement {

    return (
        <>
            <NumberInput
                hideControls
                label={"Dec"}
                decimalScale={6}
                min={-90}
                max={90}
                clampBehavior={"strict"}
                suffix="°"
                {...p.form.getInputProps("dec.degrees")}
                onChange={(e) => {
                    if (p.form.getInputProps("dec.degrees").onChange) {
                        p.form.getInputProps("dec.degrees").onChange(e);
                    }
                    //update the Aladdin viewport
                    Aladin.gotoRaDec(p.form.getValues().ra.degrees, e as number);
                }}
            />
            <Text
                size={"xs"}
                c={"gray.6"}
                style={{margin: "-4px 0px 0px 12px"}}
            >
                {AstroLib.DegToDms(p.form.getValues().dec.degrees,3)}
            </Text>
        </>
    )
}