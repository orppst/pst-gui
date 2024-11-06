import {ReactElement, useContext} from "react";
import ObservatoriesCyclesPanel from "./observatoriesCycles.tsx";
import ProposalsAccordion from "./proposalsAccordion.tsx";
import {Fieldset, Space} from "@mantine/core";
import {PanelHeader} from "../../commonPanel/appearance.tsx";
import {ProposalContext} from "../../App2.tsx";

export default
function EditorLandingPage() : ReactElement {

    const context = useContext(ProposalContext);

    return (
        <>
            <PanelHeader itemName={"Home Page"} panelHeading={context.user.fullName}/>

            <Fieldset legend={"Available Proposal Cycles"}>
                <ObservatoriesCyclesPanel/>
            </Fieldset>

            <Space h={"xl"}/>

            <PanelHeader itemName={"Your Proposals"}/>
            <ProposalsAccordion/>
        </>
    )
}