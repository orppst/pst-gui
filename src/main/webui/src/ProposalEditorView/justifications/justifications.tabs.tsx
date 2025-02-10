import {ReactElement} from "react";
import {Tabs} from "@mantine/core";
import JustificationForm from "./justification.form.tsx";
import JustificationLatex from "./justifications.latex.tsx";
import JustificationsHelp from "./justifications.help.tsx";
import {useParams} from "react-router-dom";
import { EditorPanelHeader, PanelFrame } from '../../commonPanel/appearance';

/**
 * function that ensures the first character is capitalised.
 *
 * @param {string} string: the string to modify the first character of.
 * @return {string} the string with the first character capitalised.
 */
function capitalizeFirstChar(string : string) : string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * builds the new justification page.
 *
 * @return {React.ReactElement}
 * @constructor
 */
export function JustificationsTabs() : ReactElement {
    // get the justification data we need for the new page, as well as the proposal code.
    const { justification, justificationType, selectedProposalCode } = useParams();

    // returns the React html code for the justification tabs.
    return (
        <PanelFrame>
            <EditorPanelHeader proposalCode={Number(selectedProposalCode)}
                               panelHeading={
                                    "View/Edit " + capitalizeFirstChar(justificationType) + " Justification"} />
            <Tabs defaultValue={'editor'} variant={"outline"}>
                <Tabs.List>
                    <Tabs.Tab value={'editor'}>
                        Editor
                    </Tabs.Tab>

                    <Tabs.Tab value={'latexService'} disabled={justification.format !== 'latex'}>
                        LaTeX Service
                    </Tabs.Tab>

                    <Tabs.Tab value={'userHelp'} ml={"auto"}>
                        Help
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={'editor'} mt={"sm"}>
                    <JustificationForm justification={justification}
                                       which={justificationType}/>
                </Tabs.Panel>

                <Tabs.Panel value={'latexService'} mt={"sm"}>
                    <JustificationLatex which={justificationType} />
                </Tabs.Panel>

                <Tabs.Panel value={'userHelp'} mt={"sm"}>
                    <JustificationsHelp />
                </Tabs.Panel>
            </Tabs>
        </PanelFrame>
    )
}