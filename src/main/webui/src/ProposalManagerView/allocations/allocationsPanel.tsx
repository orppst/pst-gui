import {ReactElement} from "react";
import {Alert, Container, Fieldset, Grid, Loader, ScrollArea, Space} from "@mantine/core";
import {useParams} from "react-router-dom";
import {ManagerPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import AllocatedAccordion from "./allocated.accordion.tsx";
import {
    useAllocatedProposalResourceGetAllocatedProposals,
    useAvailableResourcesResourceGetCycleResourceTotal,
    useAvailableResourcesResourceGetCycleResourceTypes,
    useProposalCyclesResourceGetProposalCycleDates
} from "../../generated/proposalToolComponents.ts";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import ResourceStatsTable from "./resourceStats.table.tsx";
import {HaveRole} from "../../auth/Roles.tsx";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import ResourceModeGradeTotalsTable from "./resourceModeGradeTotals.table.tsx";

export default
function AllocationsPanel() : ReactElement {

    const {selectedCycleCode} = useParams();

    const allocated =
        useAllocatedProposalResourceGetAllocatedProposals({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    const cycleDates =
        useProposalCyclesResourceGetProposalCycleDates({
        pathParams: {cycleCode: Number(selectedCycleCode)}
    })

    const totalTimeAvailable =
        useAvailableResourcesResourceGetCycleResourceTotal({
            pathParams: {
                cycleCode: Number(selectedCycleCode),
                resourceName: 'observing time'
            }
        })

    const cycleResourceTypes =
        useAvailableResourcesResourceGetCycleResourceTypes({
            pathParams: {cycleCode: Number(selectedCycleCode)}
        })

    if(!HaveRole(["tac_admin", "tac_member"])) {
        return <>Not authorised</>
    }

    if (allocated.isLoading || cycleDates.isLoading
        || totalTimeAvailable.isLoading || cycleResourceTypes.isLoading) {
        return(<Loader />)
    }

    if (allocated.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load allocated proposals"}
                error={getErrorMessage(allocated.error)}
            />
        )
    }

    if (cycleDates.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load Proposal Cycle dates"}
                error={getErrorMessage(cycleDates.error)}
            />
        )
    }

    if (totalTimeAvailable.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to load total available resource"}
                error={getErrorMessage(totalTimeAvailable.error)}
            />
        )
    }

    if (cycleResourceTypes.isError) {
        return (
            <AlertErrorMessage
                title={"Failed to load cycle resource types"}
                error={getErrorMessage(cycleResourceTypes.error)}
            />
        )
    }

    let observingTimeUnit  = cycleResourceTypes.data?.find(o =>
        o.name === 'observing time')?.code!

    return (
        <PanelFrame>
            <ManagerPanelHeader
                proposalCycleCode={Number(selectedCycleCode)}
                panelHeading={"Allocations"}
            />
            {new Date(cycleDates.data?.submissionDeadline!).getTime() > new Date().getTime() ?
                <Container size={"50%"} mt={100}>
                    <Alert variant={"light"} title={"Submission Deadline not surpassed"}>
                        Cannot allocate proposals before the submission deadline:
                        <Space h={"xs"}/>
                        {new Date(cycleDates.data?.submissionDeadline!).toUTCString()}
                    </Alert>
                </Container>
                :
                <Grid columns={10}>
                    <Grid.Col
                        span={{base: 10, xl: 4}}
                        order={{base: 1, xl: 2}}
                    >
                        <Fieldset legend={"Resource Amounts"}>
                            <ResourceStatsTable
                                cycleCode={Number(selectedCycleCode)}
                                totalAvailable={totalTimeAvailable.data!}
                                cycleResourceTypes={cycleResourceTypes.data!}
                            />
                        </Fieldset>
                        <Fieldset legend={"Observing Time Totals" + " (" + observingTimeUnit + ")"}>
                            <ResourceModeGradeTotalsTable
                                cycleId={Number(selectedCycleCode)}
                            />
                        </Fieldset>
                    </Grid.Col>
                    <Grid.Col
                        span={{base: 10, xl: 6}}
                        order={{base: 2, xl: 1}}
                    >
                        <Fieldset legend={"Allocate Resources"}>
                            <ScrollArea>
                                <AllocatedAccordion
                                    allocatedIds={allocated.data!}
                                    cycleResourceTypes={cycleResourceTypes.data!}
                                    totalTimeAvailable={totalTimeAvailable.data!}
                                />
                            </ScrollArea>
                        </Fieldset>
                    </Grid.Col>

                </Grid>
            }
        </PanelFrame>
    )
}