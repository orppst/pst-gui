import {ReactElement, useContext} from "react";
import ObservatoriesCyclesPanel from "./observatoriesCycles.tsx";
import ProposalsAccordion from "./proposalsAccordion.tsx";
import {Fieldset, Loader, Space} from "@mantine/core";
import {PanelHeader} from "../../commonPanel/appearance.tsx";
import {ProposalContext} from "../../App2.tsx";
import {
    useProposalCyclesResourceGetProposalCycles,
    useProposalResourceGetProposals,
} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";




export default
function EditorLandingPage() : ReactElement {

    const context = useContext(ProposalContext);

    const openProposalCycles =
        useProposalCyclesResourceGetProposalCycles({})

    const proposalCycles = useProposalCyclesResourceGetProposalCycles({
        queryParams: {includeClosed: true},
    })

    const proposals =
        useProposalResourceGetProposals({})

    if (proposals.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load proposals"}
                error={proposals.error}
            />
        )
    }

    if (openProposalCycles.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load open proposal cycles"}
                error={openProposalCycles.error}
            />
        )
    }

    if (proposalCycles.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load proposal cycles"}
                error={proposalCycles.error}
            />
        )
    }

    if (proposals.isLoading || openProposalCycles.isLoading || proposalCycles.isLoading) {
        return <Loader size={"xl"} />
    }


    return (
        <>
            <PanelHeader itemName={"Home Page"} panelHeading={context.user.fullName}/>

            <Fieldset legend={"Available Proposal Cycles"}>
                <ObservatoriesCyclesPanel cycles={openProposalCycles.data!}/>
            </Fieldset>

            <Space h={"xl"}/>

            <PanelHeader itemName={"Your Proposals"}/>
            <ProposalsAccordion
                proposals={proposals.data!}
                openCycles={openProposalCycles.data!}
                allCycles={proposalCycles.data!}
                investigatorName={context.user.fullName!}
            />
        </>
    )
}