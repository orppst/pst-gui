import {ReactElement} from "react";
import {Stack, Text, TextInput} from "@mantine/core";
import {AstroLib} from "@tsastro/astrolib";
import {UseFormReturnType} from "@mantine/form";
import {Aladin, generateTargetDefaultName, NewTargetFormValues} from "./New.tsx";
import * as React from "react";

export default
function TargetRaInput(p: {
    form: UseFormReturnType<NewTargetFormValues>
    setNameUnique: React.Dispatch<React.SetStateAction<boolean>>
}) : ReactElement {

    return(
        <Stack>
            <TextInput
                label={"RA"}
                {...p.form.getInputProps("ra")}
                onBlur={(e) => {
                    if (p.form.getInputProps("ra").onBlur) {
                        p.form.getInputProps("ra").onBlur(e);
                    }
                    //get the live value from the input
                    let raValue: string = p.form.getValues()["ra"];
                    //regex to check for sexagesimal input
                    const regexpsgm = new RegExp(/(\d{1,3})\D(\d{1,2})\D(\d{1,2}(\.\d+)[sS]*)/);
                    //regex to check for decimal input
                    const regexdec = new RegExp(/[0-9]*\.[0-9]*/);

                    //if we have sexagesimal input use as is
                    if(regexpsgm.test(raValue))
                    {
                        //set the field value to the input
                        p.form.setFieldValue("ra", raValue);
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
                            Number(AstroLib.HmsToDeg(p.form.getValues().ra)),
                            AstroLib.DmsToDeg(p.form.getValues().dec)
                        );
                    }
                    //if we have decimal
                    else if(regexdec.test(raValue))
                    {
                        //convert the decimal to sexagesimal
                        raValue = String(AstroLib.DegToHms(parseFloat(raValue)));
                        p.form.setFieldValue("RA", raValue);
                        //if we have no name for this object, generate one
                        if(p.form.getValues().targetName == "")
                        {
                            let generatedName = generateTargetDefaultName();
                            p.form.setFieldValue('targetName', generatedName);

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

                    //update the Aladin viewport
                    Aladin.gotoRaDec(
                        Number(AstroLib.HmsToDeg(p.form.getValues().ra)),
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