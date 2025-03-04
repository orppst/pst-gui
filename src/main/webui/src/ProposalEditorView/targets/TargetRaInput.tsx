import {Dispatch, ReactElement, SetStateAction, useState} from "react";
import {Stack, Text, TextInput} from "@mantine/core";
import {AstroLib} from "@tsastro/astrolib";
import {UseFormReturnType} from "@mantine/form";
import {Aladin, generateTargetDefaultName, NewTargetFormValues} from "./New.tsx";

export default
function TargetRaInput(p: {
    form: UseFormReturnType<NewTargetFormValues>
    setNameUnique: Dispatch<SetStateAction<boolean>>
}) : ReactElement {

    const [invalidMessage, setInvalidMessage] = useState("");

    return(
        <Stack gap={"xs"}>
            <TextInput
                label={"RA"}
                placeholder={"e.g., 15 30 00.0 OR 225.5"}
                {...p.form.getInputProps("ra")}
                error={invalidMessage.length > 0 ? invalidMessage : null}
                onChange={e => {
                    if (p.form.getInputProps("ra").onChange)
                        p.form.getInputProps("ra").onChange(e);

                    const nonValidChars = /[^0-9 :.]/

                    if (nonValidChars.test(e.currentTarget.value)) {
                        setInvalidMessage("Invalid character entered")
                    } else {
                        setInvalidMessage("")
                    }
                }}
                onBlur={(e) => {
                    if (p.form.getInputProps("ra").onBlur) {
                        p.form.getInputProps("ra").onBlur(e);
                    }
                    //get the live value from the input
                    let raValue: string = e.currentTarget.value;

                    if (raValue.length === 0) return

                    //regex to check for sexagesimal input
                    const validRaSgm = /^\d{1,2}([ :])\d{1,2}([ :])\d{1,2}(?:[.]\d+)?$/
                    //regex to check for decimal input
                    const validRaDegrees = /^\d{1,3}(?:[.]\d+)?$/

                    let testSgm = validRaSgm.test(raValue)
                    let testDeg = validRaDegrees.test(raValue)

                    if (!testSgm && !testDeg) {
                        setInvalidMessage("Invalid number format")
                        return
                    }

                    if (testSgm) {
                        //when no fractional part is given Astrolib gives up, so we append for semantics here
                        if (!raValue.includes('.')) raValue += '.0'
                    }

                    let raFloatDegrees = testDeg ? parseFloat(raValue) : AstroLib.HmsToDeg(raValue)

                    if (raFloatDegrees < 0 || raFloatDegrees > 360) {
                        setInvalidMessage("Value out-of-bounds")
                        return
                    }

                    if (testDeg) {
                        //DJW: Astrolib DegToHms prepend sign issue
                        raValue = AstroLib.DegToHms(parseFloat(raValue)).slice(1)
                    }

                    p.form.setFieldValue('ra', raValue);

                    //if we have no name for this object, generate one
                    if(p.form.getValues().targetName == "" )
                    {
                        let generatedName = generateTargetDefaultName();
                        p.form.setFieldValue('targetName',generatedName);

                        //allow submission in case this was previously locked
                        p.setNameUnique(true);
                    }

                    //update the Aladin viewport
                    Aladin.gotoRaDec(
                        Number(AstroLib.HmsToDeg(raValue)),
                        AstroLib.DmsToDeg(p.form.getValues().dec)
                    );
                }}
            />
            <Text
                size={"xs"}
                c={"gray.6"}
                style={{margin: "-4px 0px 0px 12px"}}
            >
                {AstroLib.HmsToDeg(p.form.getValues().ra)}°
            </Text>
        </Stack>

    )
}