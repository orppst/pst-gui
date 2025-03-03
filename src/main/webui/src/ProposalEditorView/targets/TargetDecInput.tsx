import {Dispatch, ReactElement, SetStateAction, useState} from "react";
import {Stack, Text, TextInput} from "@mantine/core";
import {AstroLib} from "@tsastro/astrolib";
import {Aladin, generateTargetDefaultName, NewTargetFormValues} from "./New.tsx";
import {UseFormReturnType} from "@mantine/form";

export default
function TargetDecInput(p: {
    form: UseFormReturnType<NewTargetFormValues>
    setNameUnique: Dispatch<SetStateAction<boolean>>
}) : ReactElement {

    const [invalidMessage, setInvalidMessage] = useState("");

    return (
        <Stack gap={"xs"}>
            <TextInput
                label={"Dec"}
                placeholder={"e.g., -12 30 00.0 OR -12.5"}
                {...p.form.getInputProps("dec")}
                error={invalidMessage.length > 0 ? invalidMessage : null}
                onChange={e => {
                    if (p.form.getInputProps("dec").onChange) {
                        p.form.getInputProps("dec").onChange(e);
                    }

                    const nonValidChars = /[^0-9 :+-.]/

                    if (nonValidChars.test(e.currentTarget.value)) {
                        setInvalidMessage("Invalid character entered")
                    } else {
                        setInvalidMessage("")
                    }
                }}
                onBlur={(e) => {
                    if (p.form.getInputProps("dec").onBlur) {
                        p.form.getInputProps("dec").onBlur(e);
                    }
                    //get the live value from the input
                    let decValue: string = e.currentTarget.value;

                    if (decValue.length === 0) return

                    //regex to check for sexagesimal input
                    const validDecSgm = /^[-+]?\d{1,2}([ :])\d{1,2}([ :])\d{1,2}(?:[.]\d+)?$/

                    //regex to check for decimal input
                    const validDecDegrees = /^[-+]?\d{1,2}(?:[.]\d+)?$/

                    let testSgm = validDecSgm.test(decValue)
                    let testDeg = validDecDegrees.test(decValue)

                    if (!testSgm && !testDeg) {
                        setInvalidMessage("Invalid number format")
                        return
                    }

                    if (testSgm) {
                        //problem with Astrolib.DmsToDeg when no decimal point given so just append '.0'
                        //if no fractional part is given
                        if (!decValue.includes('.')) {
                            decValue += '.0'
                        }
                    }

                    //check valid range for declination
                    let decFloatDegrees = testDeg ? parseFloat(decValue) : AstroLib.DmsToDeg(decValue)

                    if (decFloatDegrees < -90 || decFloatDegrees > 90) {
                        setInvalidMessage("Value out-of-bounds")
                        return
                    }

                    if (testDeg) {
                        decValue = String(AstroLib.DegToDms(parseFloat(decValue)));
                    }

                    p.form.setFieldValue("dec", decValue);

                    //if we have no name for this object, generate one
                    if(p.form.getValues().targetName == "")
                    {
                        let generatedName = generateTargetDefaultName();

                        p.form.setFieldValue('targetName',generatedName);

                        //allow submission in case this was previously locked
                        p.setNameUnique(true);
                    }

                    //update the Aladin viewport
                    Aladin.gotoRaDec(
                        Number(AstroLib.HmsToDeg(p.form.getValues().ra)),
                        AstroLib.DmsToDeg(decValue)
                    );
                }}
            />
            <Text
                size={"xs"}
                c={"gray.6"}
                style={{margin: "-4px 0px 0px 12px"}}
            >
                {AstroLib.DmsToDeg(p.form.getValues().dec)}°
            </Text>
        </Stack>
    )
}