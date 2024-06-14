import {ReactElement} from "react";
import {Fieldset} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocationsTable from "./allocations.table.tsx";
import AllocatedTable from "./allocated.table.tsx";

/*
    List all submitted proposals that have been reviewed (all reviews complete) and update
    the "success" status of each based on the reviews.

    The function that assigns a true state to "success" should also "promote" the submitted
    proposal to an allocated proposal with an initial allocation of zero resources, which
    can be adjusted later.

    List allocated proposals with the amount of resource(s) assigned to them so far, with
    a form/function to adjust the amount of resource to a desired value.
 */

export default function AllocationsPanel() : ReactElement {
    const {selectedCycleCode} = useParams();

    return (
        <PanelFrame>
            <ManagerPanelHeader proposalCycleCode={Number(selectedCycleCode)} panelHeading={"Allocations"} />
            <Fieldset legend={"Reviewed Proposals"}>
                <AllocationsTable/>
            </Fieldset>
            <Fieldset legend={"Allocated Proposals"}>
                <AllocatedTable/>
            </Fieldset>
        </PanelFrame>
    )
}