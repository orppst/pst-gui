import {JustificationProps} from "./justifications.table.tsx";
import {ReactElement} from "react";
import {Tabs} from "@mantine/core";
import JustificationForm from "./justification.form.tsx";
import JustificationLatex from "./justifications.latex.tsx";

export default
function JustificationsTabs(props : JustificationProps) : ReactElement {
    return (
        <Tabs defaultValue={'editor'} variant={"outline"}>
            <Tabs.List>
                <Tabs.Tab value={'editor'}>
                    Editor
                </Tabs.Tab>
                <Tabs.Tab value={'latexService'} disabled={props.justification.format !== 'latex'}>
                    LaTeX Service
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value={'editor'}>
                <JustificationForm {...props}/>
            </Tabs.Panel>

            <Tabs.Panel value={'latexService'}>
                <JustificationLatex which={props.which} />
            </Tabs.Panel>
        </Tabs>
    )
}