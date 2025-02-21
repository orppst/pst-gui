import {ReactElement} from "react";
import {Stack, TextInput} from "@mantine/core";
import * as React from "react";
import {UseFormReturnType} from "@mantine/form";
import {NewTargetFormValues} from "./New.tsx";
import {SubmitButton} from "../../commonButtons/save.tsx";
import TargetRaInput from "./targetRaInput.tsx";
import TargetDecInput from "./targetDecInput.tsx";


export default
function NewTargetInputs(p: {
    form: UseFormReturnType<NewTargetFormValues>,
    nameUnique: boolean
}) : ReactElement {

    return (
        <Stack>
            <TextInput
                label="Name your target"
                placeholder="User provided or use the SIMBAD search"
                description={p.nameUnique ? "Something descriptive is recommended" : null}
                error={p.nameUnique ? null :
                    p.form.getValues().targetName + " is in use, choose another name"}
                inputWrapperOrder={['label', 'description', 'error', 'input']}
                value={p.form.getValues().targetName}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>{
                    p.form.setFieldValue('targetName', e.currentTarget.value)
                }}
            />
            <TargetRaInput form={p.form}/>
            <TargetDecInput form={p.form}/>
            <SubmitButton
                toolTipLabel={"Save this target"}
                disabled={!p.form.isValid()}
            />
        </Stack>
    )
}