import {ReactElement} from "react";
import {Stack, Text, TextInput} from "@mantine/core";
import {AstroLib} from "@tsastro/astrolib";
import * as React from "react";
import {Aladin, generateTargetDefaultName} from "./New.tsx";
import {UseFormReturnType} from "@mantine/form";

export default
function TargetDecInput(p: {
    form: UseFormReturnType<any>
    setNameUnique: React.Dispatch<React.SetStateAction<boolean>>
}) : ReactElement {

    return (
        <Stack>
            <TextInput
                label={"Dec"}
                {...p.form.getInputProps("dec")}
                onBlur={(e) => {
                    if (p.form.getInputProps("dec").onBlur) {
                        p.form.getInputProps("dec").onBlur(e);
                    }
                    //get the live value from the input
                    let decValue: string = p.form.getValues().dec;

                    //regex to check for sexagesimal input
                    const regexpsgm = new RegExp(/(\d{1,2})\D(\d{1,2})\D(\d{1,2}(\.\d+)[sS]*)/);
                    //regex to check for decimal input
                    const regexdec = new RegExp(/[0-9]*\.[0-9]*/);

                    //if we have sexagesimal input use as is
                    if(regexpsgm.test(decValue))
                    {
                        //set the field value to the input
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
                            AstroLib.DmsToDeg(p.form.getValues().dec)
                        );
                    }
                    //if we have decimal
                    else if(regexdec.test(decValue))
                    {
                        //convert the decimal to sexagesimal
                        decValue = String(AstroLib.DegToDms(parseFloat(decValue)));
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
                            AstroLib.DmsToDeg(p.form.getValues().dec)
                        );
                    }
                    else
                    {
                        //if we have no valid input, reset the field - preventing submission
                        p.form.setFieldValue("targetName", "");
                    }
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