import {useNavigate, useParams} from 'react-router-dom'
import {
    useProposalResourceCloneObservingProposal,
    useProposalResourceDeleteObservingProposal,
    useProposalResourceGetObservingProposal,
    useSupportingDocumentResourceGetSupportingDocuments,
} from 'src/generated/proposalToolComponents';
import {Accordion, Avatar, Box, Container, Fieldset, Group,
        List, Space, Stack, Table, Text,} from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse,
    Investigator,
    ObjectIdentifier,
    Observation,
    RealQuantity,
    Target,
} from 'src/generated/proposalToolSchemas.ts';
import {IconEyeStar, IconNorthStar, IconTelescope} from '@tabler/icons-react';
import {ReactElement, useContext, useRef} from 'react';
import downloadProposal from './downloadProposal.tsx';
import {DIMMED_FONT_WEIGHT, JSON_SPACES, POLARIS_MODES} from 'src/constants.tsx';
import {TargetTable} from '../targets/TargetTable.tsx';
import {TechnicalGoalsTable} from '../technicalGoals/technicalGoalTable.tsx';
import {PreviewJustification} from "../justifications/justification.preview.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import DeleteButton from "../../commonButtons/delete.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {ExportButton} from "../../commonButtons/export.tsx";
import {modals} from "@mantine/modals";
import CloneButton from "../../commonButtons/clone.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {
    TelescopeOverviewTableState, useMutationOpticalCopyProposal,
    useOpticalOverviewTelescopeTableData, useOpticalOverviewTelescopeTimingData,
    useOpticalTelescopeResourceDeleteProposalTelescopeData,
    useOpticalTelescopeTableData
} from "../../util/telescopeComms";
import {ProposalContext, useToken} from "../../App2";
import {OpticalTableGenerator} from "../observations/optical/observationOpticalTable";
import * as Schemas from "../../generated/proposalToolSchemas";

/*
      title    -- string
      summary  -- string
      kind     -- enum
      submitted  -- boolean
      scientific justification -- string (file?)
      technical justification  -- string (file?)
      investigators -- list of objects   -- reuse investigators?
      related proposals -- list of strings  - titles as navigation links?
      supporting documents -- list of files - file names/titles as download links?
      observations -- list of objects
        - target
        - technical goal
        - field
        - constraints e.g., timing windows
      --------------------------------------------------------------------------------------------------
      targets -- list of objects  - list of target that have been added but NOT yet used in observations
      fields  -- list of objects  - list of fields ""
      technical goals -- list of objects - list of technical goals ""

        General strategy:
        list of strings use a List.
        list of objects use an Accordion
 */



/**
 * internal interface for the investigator.
 *
 * @param {string} fullName the full name of the investigator.
 * @param {string} role the role of the investigator.
 * @param {string} home the home of the investigator.
 */
interface InvestigatorLabelProps {
    fullName: string;
    role: string;
    home: string;
}

// the type for the extracting data of observations for overview telescope table.
export type  TelescopeSummaryState = {
    telescopeTimeValue: string, telescopeTimeUnit: string,
    condition: string, targetName: string, telescopeName: string
}


/**
 *
 * @param an InvestigatorLabelProps object.
 * @return {ReactElement} the html to present a given investigator.
 * @constructor
 */
function InvestigatorAccordionLabel(
        {fullName, role, home} : InvestigatorLabelProps): ReactElement {
    return (
        <Group wrap={"nowrap"}>
            <Avatar radius={"md"} />
            <div>
                <Text>{fullName}</Text>
                <Text size={"sm"} c={"dimmed"} fw={DIMMED_FONT_WEIGHT}>
                    {role} | {home}
                </Text>
            </div>
        </Group>
    )
}

/**
 * generates a table for a given investigator.
 *
 * @param {Investigator} investigator the investigator for the table.
 * @return {ReactElement} the html for the table of investigators.
 * @constructor
 */
function InvestigatorAccordionContent(
        investigator : Investigator): ReactElement {
    return (
        <Table>
            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>for phd?</Table.Td><Table.Td>{
                        investigator.forPhD ? 'yes' : 'no'}
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>email</Table.Td><Table.Td>{
                        investigator.person?.eMail}
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>orcid ID</Table.Td><Table.Td>{
                        investigator.person?.orcidId?.value}
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Institute address</Table.Td><Table.Td>{
                        investigator.person?.homeInstitute?.address}
                    </Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    )
}

/**
 * interface used in the observation panel.
 * @param {string} targetName the target name.
 * @param {string} observationType the type of observation.
 * @param {CalibrationTargetIntendedUse} intendedUse the targets intended use.
 */
interface ObservationOpticalLabelProps {
    targetName: string;
    observationType: string;
    intendedUse?: CalibrationTargetIntendedUse;
}

/**
 * interface used in the observation panel.
 * @param {string} targetName the target name.
 * @param {string} observationType the type of observation.
 * @param {CalibrationTargetIntendedUse} intendedUse the targets intended use.
 * @param {RealQuantity} spectralPoint the spectral point.
 */
interface ObservationRadioLabelProps {
    targetName: string;
    observationType: string;
    intendedUse?: CalibrationTargetIntendedUse;
    spectralPoint: RealQuantity;
}

/**
 * creates the observation label.
 * @param ObservationLabelProps: the data for the method.
 * @return {ReactElement} the htm for the observation accordion label.
 * @constructor
 */
function ObservationRadioAccordionLabel(
    {targetName, observationType, intendedUse, spectralPoint} :
        ObservationRadioLabelProps): ReactElement {
    return(
        <Group wrap={"nowrap"}>
            <Avatar radius={"sm"}>
                <IconNorthStar size={"1em"}/>
            </Avatar>
            <div>
                <Text>{targetName}</Text>
                <Text size={"sm"} c={"dimmed"} fw={DIMMED_FONT_WEIGHT}>
                    {observationType}
                    {intendedUse && ", " + intendedUse.toLowerCase()} { ", " }
                    {spectralPoint.value} {spectralPoint.unit?.value}
                </Text>
            </div>
        </Group>
    )
}

/**
 * creates the observation label for opticals.
 * @param ObservationLabelProps: the data for the method.
 * @return {ReactElement} the htm for the observation accordion label.
 * @constructor
 */
function ObservationOpticalAccordionLabel(
    {targetName, observationType, intendedUse}:ObservationOpticalLabelProps):
        ReactElement {
    const polarisMode = useContext(ProposalContext).mode;
    return(
        <Group wrap={"nowrap"}>
            <Avatar radius={"sm"}>
                {polarisMode == POLARIS_MODES.BOTH ?
                    <IconEyeStar size={"1em"}/> :
                    <IconNorthStar size={"1em"}/>}
            </Avatar>
            <div>
                <Text>{targetName}</Text>
                <Text size={"sm"} c={"dimmed"} fw={DIMMED_FONT_WEIGHT}>
                    {observationType}
                    {intendedUse && ", " + intendedUse.toLowerCase()}
                </Text>
            </div>
        </Group>
    )
}

/**
 * interface for the observation content props.
 * @param {number} proposalCode: the proposal code.
 * @param {number} targetID the target id in the database.
 * @param {number} technicalGoalId the technical goal id in the database.
 */
interface ObservationRadioContentProps {
    proposalCode: number;
    targetIds: number[];
    technicalGoalId: number;
}

/**
 * generates the observation radio accordion content.
 * @param ObservationContentProps: data for the method.
 * @return {ReactElement} the html for the observation accordion content.
 * @constructor
 */
function ObservationRadioAccordionContent(
    {proposalCode, targetIds, technicalGoalId} : ObservationRadioContentProps) :
    ReactElement {

    const listOfTargets = [] as ObjectIdentifier [];

    targetIds.map((targetId: number) => listOfTargets.push(
        {dbid: targetId, code: proposalCode.toString()}))

    return (
        //TODO: consider a Grid instead of Group
        <Group>
            <TargetTable selectedProposalCode={proposalCode.toString()}
                         isLoading={false}
                         data = {listOfTargets}
                         showButtons={false}
                         selectedTargets={undefined}
                         boundTargets={[]}/>
            <TechnicalGoalsTable goals={[{dbid: technicalGoalId,
                                          code: proposalCode.toString()}]}
                                 boundTechnicalGoalIds={[]}
                                 selectedTechnicalGoal={undefined}
                                 showButtons={false}/>
        </Group>
    )
}

/**
 * generates the observation optical accordion content.
 * @return {ReactElement} the html for the observation accordion content.
 * @constructor
 */
function ObservationOpticalAccordionContent(
    proposalCode: number, targetIds: number[], observation: Observation):
    ReactElement {

    const listOfTargets = [] as ObjectIdentifier [];

    targetIds.map((targetId: number) => listOfTargets.push(
        {dbid: targetId, code: proposalCode.toString()}))

    const observations: Observation[] = [observation];

    return (
        //TODO: consider a Grid instead of Group
        <Group>
            {OpticalTableGenerator(observations, false)}
        </Group>
    )
}

/**
 * creates the html for the overview panel.
 * @return {ReactElement} the html of the overview panel.
 * @constructor
 */
function OverviewPanel(props: {forceUpdate: () => void}): ReactElement {

    const authToken = useToken();

    let { selectedProposalCode } = useParams();
    selectedProposalCode = selectedProposalCode!;

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const polarisMode = useContext(ProposalContext).mode;

    const cloneProposalMutation =
        useProposalResourceCloneObservingProposal();

    const deleteProposalMutation =
        useProposalResourceDeleteObservingProposal()

    const deleteProposalOpticalTelescopeMutation =
        useOpticalTelescopeResourceDeleteProposalTelescopeData();

    // mutation for the optical side. this allows us to bypass the 2 database
    // transaction issue.
    const submitOpticalProposalMutation = useMutationOpticalCopyProposal()

    const {data: supportingDocs} =
        useSupportingDocumentResourceGetSupportingDocuments({
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            }
        });

    // the observation ids for the optical observations.
    const {
        data: opticalData,
        error: opticalError,
        isLoading: opticalLoading,
    } = useOpticalTelescopeTableData({
        proposalID: selectedProposalCode!
    });

    // holder for the reference needed for the pdf generator to work.
    const printRef = useRef<HTMLInputElement>(null);

    const { data: proposalsData ,
            error: proposalsError,
            isLoading: proposalsIsLoading } =
        useProposalResourceGetObservingProposal({
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            }
        });

    if (proposalsError) {
        return (
            <Box>
                <pre>{JSON.stringify(proposalsError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }
    if (opticalError) {
        return (
            <Box>
                <pre>{JSON.stringify(opticalError, null, JSON_SPACES)}</pre>
            </Box>
        );
    }

    /**
     * handles the title display panel.
     * @return {ReactElement} the html for the title display panel.
     * @constructor
     */
    const DisplayTitle = (): ReactElement => {
        return (
            <h1>{proposalsData?.title}</h1>
        )
    }

    /**
     * handles the summary display panel.
     * @return {React.ReactElement} the html for the summary display panel.
     * @constructor
     */
    const DisplaySummary = (): ReactElement => {
        return (
            <>
                <h3>Summary</h3>
                <Text style={{ whiteSpace: 'pre-wrap',
                               overflowWrap: 'break-word'}}>
                    {proposalsData?.summary}
                </Text>
            </>
        )
    }

    /**
     * handles the display kind panel.
     * @return {React.ReactElement} the html for the display kind panel.
     * @constructor
     */
    const DisplayKind = (): ReactElement => {
        return (
            <>
                <h3>Kind</h3>
                <Text>{proposalsData?.kind}</Text>
            </>
        )
    }

    /**
     * handles the scientific justification panel
     * @return {React.ReactElement} the html for the scientific justification
     * panel.
     * @constructor
     */
    const DisplayScientificJustification = (): ReactElement => {
        return (
            <>
                <h3>Scientific Justification</h3>
                {PreviewJustification(
                    proposalsData?.scientificJustification?.format!,
                    proposalsData?.scientificJustification?.text!)
                }
            </>
        )
    }

    /**
     * handles the technical justification panel.
     * @return {React.ReactElement} the html for the technical justification.
     * @constructor
     */
    const DisplayTechnicalJustification = (): ReactElement => {
        return (
            <>
                <h3>Technical Justification</h3>
                {PreviewJustification(
                    proposalsData?.technicalJustification?.format!,
                    proposalsData?.technicalJustification?.text!)
                }
            </>
        )
    }

    /**
     * generates the HTML for the investigators for the overview page.
     * @return {ReactElement} the html for the investigators.
     * @constructor
     */
    const DisplayInvestigators = (): ReactElement => {
        const investigators = proposalsData?.investigators?.map(
            (investigator) => (
                <Accordion.Item key={investigator.person?.orcidId?.value}
                                value={investigator.person?.fullName!}>
                    <Accordion.Control>
                        <InvestigatorAccordionLabel
                            fullName={investigator.person?.fullName!}
                            role={investigator.type!}
                            home={investigator.person?.homeInstitute?.name!}
                        />
                    </Accordion.Control>
                    <Accordion.Panel>
                        <InvestigatorAccordionContent {...investigator} />
                    </Accordion.Panel>
                </Accordion.Item>
        ))

        return (
            <>
                <h3>Investigators</h3>
                {
                    proposalsData?.investigators &&
                    proposalsData.investigators.length > 0 ?
                        <Accordion chevronPosition={"right"}>
                            {investigators}
                        </Accordion> :
                        <Text c={"yellow"}>No investigators added</Text>
                }

            </>
        )
    }

    /**
     * generates the html for the supporting documents for the overview page.
     *
     * @return {ReactElement} the html for the supporting documents.
     * @constructor
     */
    const DisplaySupportingDocuments = (): ReactElement => {

        const documents = proposalsData?.supportingDocuments?.map((document) =>(
            <List.Item key={document.location}>{document.title}</List.Item>
        ))

        return (
            <>
                <h3>Supporting Documents</h3>
                {
                    proposalsData?.supportingDocuments &&
                    proposalsData.supportingDocuments.length > 0 ?
                        <List
                            style={{
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word'}}
                        >
                            {documents}
                        </List> :
                        <Text c={"yellow"}>No supporting documents added</Text>
                }
            </>
        )
    }

    /**
     * generates the display for the related proposals for the overview page.
     *
     * @return {ReactElement} the html for the related proposal panel.
     * @constructor
     */
    const DisplayRelatedProposals = (): ReactElement => {

        const proposals = proposalsData?.relatedProposals?.map((related) =>(
            <List.Item key={related.proposal?.xmlId}>
                {related.proposal?.title}
            </List.Item>
        ))

        return (
            <>
                <h3>Related Proposals</h3>
                {
                    proposalsData?.relatedProposals &&
                    proposalsData.relatedProposals.length > 0 ?
                        <List>
                            {proposals}
                        </List> :
                        <Text c={"yellow"}>No related proposals added</Text>
                }
            </>
        )
    }

    /**
     * builds a radio accordion.
     *
     * @param observation: the radio observation
     * @param targetNames: the target names
     * @param index: the index
     * @param observationType: the type of observation (target, or calibration)
     */
    const radioAccordion = (
            observation: Observation, targetNames: string,
            index: number, observationType: string): ReactElement => {
        const technicalGoalObj =
            proposalsData?.technicalGoals?.find((techGoal) =>
                techGoal._id === observation.technicalGoal)!
        // Ideally we should use the observation id for the 'key' but
        // we don't have it at this point, so we use the map index
        // instead
        return(
            <Accordion.Item key={observation._id} value={String(index)}>
                <Accordion.Control>
                    <ObservationRadioAccordionLabel
                        targetName={targetNames}
                        observationType={observationType}
                        intendedUse={
                            observationType === 'Calibration Obs.' ?
                            (observation as CalibrationObservation).intent :
                            undefined}
                        spectralPoint={
                            technicalGoalObj.performance?.representativeSpectralPoint!}
                    />
                </Accordion.Control>
                <Accordion.Panel>
                    <ObservationRadioAccordionContent
                        proposalCode={Number(selectedProposalCode)}
                        targetIds={observation.target as number []}
                        technicalGoalId={technicalGoalObj._id!}
                    />
                </Accordion.Panel>
            </Accordion.Item>
        )
    }

    /**
     * builds an optical accordion.
     *
     * @param observation: the optical observation
     * @param targetNames: the target names
     * @param index: the index
     * @param observationType: the type of observation (target, or calibration)
     */
    const opticalAccordion = (
            observation: Observation, targetNames: string,
            index: number, observationType: string): ReactElement => {

        return(
            <Accordion.Item key={observation._id} value={String(index)}>
                <Accordion.Control>
                    <ObservationOpticalAccordionLabel
                        targetName={targetNames}
                        observationType={observationType}
                        intendedUse={
                            observationType === 'Calibration Obs.' ?
                                (observation as CalibrationObservation).intent :
                                undefined}
                    />
                </Accordion.Control>
                <Accordion.Panel>
                    {ObservationOpticalAccordionContent(
                        Number(selectedProposalCode),
                        observation.target as number [],
                        observation)
                    }
                </Accordion.Panel>
            </Accordion.Item>
        )
    }

    /**
     * returns the target name
     * @param observation
     */
    const getTargetName = (observation:  Observation): string => {
        //get all the target objects
        const targetObjs = [] as Target[];

        observation.target?.map((obsTarget) => {
            const targetObj = proposalsData?.targets?.find((target) =>
                target._id === obsTarget)!

            targetObjs.push(targetObj);
        });

        // create a string of the first target names
        if (targetObjs.length != 0) {
            let targetNames = targetObjs[0].sourceName!;
            let targetIndex = 0;

            while (++targetIndex < 3
            && targetIndex < targetObjs.length) {
                targetNames += ", " + targetObjs[targetIndex].sourceName;
            }

            const remaining = targetObjs.length - targetIndex;

            if (remaining > 0) {
                targetNames += ", and " + remaining + " more";
            }
            return targetNames;
        }
        return "";
    }

    /**
     * creates the observations panel for the overview page.
     *
     * @return ReactElement the generated HTML for the observations panel.
     * @constructor
     */
    const DisplayObservations = (): ReactElement => {
        const observations =
            proposalsData?.observations?.map((observation, index) => {
                const targetNames = getTargetName(observation);

                const observationType =
                    observation["@type"] === 'proposal:TargetObservation' ?
                        'Target Obs.' : 'Calibration Obs.';

                switch(polarisMode) {
                    case POLARIS_MODES.OPTICAL:
                        if (opticalData!.has(observation._id!.toString())) {
                            return opticalAccordion(
                                observation, targetNames, index,
                                observationType);
                        } else {
                            return <Accordion.Item key={observation._id}
                                                   value={String(index)}/>
                        }
                    case POLARIS_MODES.BOTH:
                        if (opticalData!.has(observation._id!.toString())) {
                            return opticalAccordion(
                                observation, targetNames, index,
                                observationType);
                        } else {
                            return radioAccordion(
                                observation, targetNames, index,
                                observationType);
                        }
                    case POLARIS_MODES.RADIO:
                        if (!opticalData!.has(observation._id!.toString())) {
                            return radioAccordion(
                                observation, targetNames, index,
                                observationType);
                        } else {
                            return <Accordion.Item key={observation._id}
                                                   value={String(index)}/>
                        }
                    default:
                        notifyError("invalid polaris mode", polarisMode)
                }
            })

        return (
            <>
                <h3>Observations</h3>
                {
                    proposalsData?.observations &&
                    proposalsData.observations.length > 0 ?
                        <Accordion>
                            {observations}
                        </Accordion> :
                        <Text c={"yellow"}>No observations added</Text>
                }
            </>
        )
    }

    /**
     * returns the header for the telescope summary table.
     *
     * @return {React.ReactElement} the html for the table header.
     */
    function observationOpticalSummaryTableHeader(): ReactElement {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Target Name</Table.Th>
                    <Table.Th>Telescope Time Requirement</Table.Th>
                    <Table.Th>Telescope Condition</Table.Th>
                </Table.Tr>
            </Table.Thead>
        );
    }

    /**
     * builds a summary row data.
     *
     * @param row: the row.
     * @param key: the key.
     */
    const OpticalBasicSummaryRow =
        (row: TelescopeSummaryState, key: string): ReactElement => {
            return (
                <Table.Tr key={"observation:" + key}>
                    <Table.Td>{row.targetName}</Table.Td>
                    <Table.Td>{row.telescopeTimeValue}  {row.telescopeTimeUnit}</Table.Td>
                    <Table.Td>{row.condition}</Table.Td>
                </Table.Tr>
            )
        }

    /**
     * locates the observation from a given id.
     *
     * @param obsId: the observation id to find the observation of.
     * @param observations: the list of observations.
     */
    const findObs = (obsId: string, observations: Observation[]): Observation => {
        for (const obs of observations) {
            if (obs._id!.toString() == obsId) {
                return obs;
            }
        }
        return {};
    }

    /**
     * builds the summary data from the observation data.
     * @param data: the observation data.
     * @param proposalData: the proposal data.
     * @constructor
     */
    function buildSummaryData(
            data: Map<string, TelescopeOverviewTableState>,
            proposalData: Schemas.ObservingProposal):
        Map<string, TelescopeSummaryState[]> {
        const summaryData: Map<string, TelescopeSummaryState[]> =
            new Map<string, TelescopeSummaryState[]>();

        for (const [obsID, observationData] of data.entries()) {
            const key = observationData.telescopeName + " : " +
                observationData.instrumentName;
            const obs = findObs(obsID, proposalData!.observations!);

            if (summaryData.has(key)) {
                summaryData.get(key)!.push(
                    {telescopeTimeValue: observationData.telescopeTimeValue,
                     telescopeTimeUnit: observationData.telescopeTimeUnit,
                     condition: observationData.condition,
                     targetName: getTargetName(obs),
                     telescopeName: observationData.telescopeName}
                )
            } else {
                const array = [{
                    telescopeTimeValue: observationData.telescopeTimeValue,
                    telescopeTimeUnit: observationData.telescopeTimeUnit,
                    condition: observationData.condition,
                    targetName: getTargetName(obs),
                    telescopeName: observationData.telescopeName
                }]
                summaryData.set(key, array);
            }
        }

        return summaryData;
    }

    /**
     * builds a table showing all the telescopes and time based for it per
     * instrument.
     * @constructor
     */
    function DisplayTelescopeSummary(selectedProposalCode: string): ReactElement {
        const {
            data: opticalData,
            error: opticalError,
            isLoading: opticalLoading,
        } = useOpticalOverviewTelescopeTableData({
            proposalID: selectedProposalCode
        });

        const {
            data: telescopeTiming,
            error: telescopeTimingError,
            isLoading: telescopeTimingLoading,
        } = useOpticalOverviewTelescopeTimingData();

        // handle any errors
        if(opticalError) {
            return (
                <Container>
                    Unable to load optical data:
                    {getErrorMessage(opticalError)}
                </Container>
            )
        }
        if(telescopeTimingError) {
            return (
                <Container>
                    Unable to load telescope timing data:
                    {getErrorMessage(telescopeTimingError)}
                </Container>
            )
        }

        // handle any loading issues.
        if(opticalLoading) {
            return (
                <PanelFrame>
                    <Space h={"xs"}/>
                    <Group justify={'flex-end'}>
                        `Loading...`
                    </Group>
                </PanelFrame>
            )
        }

        if(telescopeTimingLoading) {
            return (
                <PanelFrame>
                    <Space h={"xs"}/>
                    <Group justify={'flex-end'}>
                        `Loading...`
                    </Group>
                </PanelFrame>
            )
        }

        if(proposalsIsLoading) {
            return (
                <PanelFrame>
                    <Space h={"xs"}/>
                    <Group justify={'flex-end'}>
                        `Loading...`
                    </Group>
                </PanelFrame>
            )
        }

        return (
            <>
                <h3>Telescopes</h3>
                {buildSummaryAccordion(
                    buildSummaryData(opticalData!, proposalsData!),
                    telescopeTiming!)}
            </>
        );
    }

    /**
     * builds the accordion label for the telescope.
     *
     * @param {string} title the telescope title.
     * @param {TelescopeSummaryState[]} arrayData the observations for the telescope.
     * @param {Map<string, number>} telescopeTiming the map between telescope and hours to nights.
     * @constructor
     */
    function TelescopeSummaryAccordionLabel(
            title: string, arrayData: TelescopeSummaryState[],
            telescopeTiming: Map<string, number>): ReactElement {
        // determine total time.
        let time = 0;
        const conditions: string[] = [];
        for (const item of arrayData) {
            if (item.telescopeTimeUnit !== "Hours") {
                time += Number(item.telescopeTimeValue) *
                    telescopeTiming.get(item.telescopeName)!;
            } else {
                time += Number(item.telescopeTimeValue);
            }
            if (!conditions.includes(item.condition)) {
                conditions.push(item.condition);
            }
        }

        // determine conditions text.
        let conditionsString = "";
        for (const condition of conditions) {
            conditionsString = conditionsString + condition + ", "
        }
        conditionsString = conditionsString.slice(0, -2)

        // generate label
        return (
            <Group wrap={"nowrap"}>
                <Avatar radius={"sm"}>
                    <IconTelescope size={"1em"}/>
                </Avatar>
                <div>
                    <Text>{title}</Text>
                    <Text size={"sm"} c={"dimmed"} fw={DIMMED_FONT_WEIGHT}>
                        total time {time} hours{ ",  "}
                        Conditions ({conditionsString})
                    </Text>
                </div>
            </Group>
        )
    }

    /**
     * builds the telescope sumamry accordion.
     *
     * @param {Map<string, TelescopeSummaryState[]>} data the telescope data.
     * @param {Map<string, number>} telescopeTiming the timing between night and hour.
     */
    function buildSummaryAccordion(
            data: Map<string, TelescopeSummaryState[]>,
            telescopeTiming: Map<string, number>):
            ReactElement {
        return (
            <Accordion>
                {Array.from(data.entries()).map(
                    ([key, arrayData], index) => (
                        <Accordion.Item key={key} value={index.toString()}>
                            <Accordion.Control>
                                {TelescopeSummaryAccordionLabel(
                                    key, arrayData, telescopeTiming)}
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Group>
                                    <Table>
                                        { observationOpticalSummaryTableHeader() }
                                        <Table.Tbody>
                                            {arrayData.map((summaryItem, itemIndex) => (
                                                OpticalBasicSummaryRow(summaryItem, itemIndex.toString())
                                             ))}
                                        </Table.Tbody>
                                    </Table>
                                </Group>
                            </Accordion.Panel>
                        </Accordion.Item>
                ))}
            </Accordion>);
    }

    /**
     * add download button for the proposal to be extracted as a tar ball.
     *
     * @return {ReactElement} the html which contains the download button.
     * @constructor
     */
    const ExportProposal = (): ReactElement => {
        return ExportButton(
            {
                toolTipLabel: `Export to a file for download`,
                disabled: false,
                onClick: handleDownloadPdf,
                label: "Export Proposal",
                variant: "filled",
                toolTipLabelPosition: "top"
            });
    }

    /**
     * generates the overview pdf and saves it to the users' disk.
     *
     * code extracted from: https://www.robinwieruch.de/react-component-to-pdf/
     * @return {Promise<void>} promise that the pdf will be saved at some point.
     */
    const handleDownloadPdf = (): void => {
        downloadProposal(
            printRef.current!,
            proposalsData!,
            supportingDocs!,
            selectedProposalCode!,
            authToken
        );
    };

    /**
     * creates the clone button for the proposal.
     * @constructor
     */
    const CloneProposal = (): ReactElement => {
        return CloneButton(
            {
                toolTipLabel:
                    `creates a new proposal from a deep copy of this proposal`,
                disabled: false,
                onClick: handleCloneProposal,
                label: "Clone Proposal",
                variant: "filled",
                toolTipLabelPosition: "top"
            }
        )
    }

    /**
     * logic for handling a clone.
     */
    const handleCloneProposal = (): void => {
        cloneProposalMutation.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        }, {
            onSuccess: (data: Schemas.ObservingProposal) => {
                const proposalObsIDs: number [] =
                    proposalsData!.observations!.map<number>((obs) => obs._id!);
                const submittedProposalObsIDs = data.observations!.map<number>(
                    (obs) => obs._id!);

                if (proposalObsIDs !== undefined &&
                        submittedProposalObsIDs !== undefined) {
                    submitOpticalProposalMutation.mutate({
                        proposalID: selectedProposalCode!,
                        obsIds: proposalObsIDs,
                        cloneID: data!._id!.toString(),
                        cloneObsIDs: submittedProposalObsIDs
                    }, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: ['pst', 'api', 'proposals']
                        }).then(() =>
                            notifySuccess("Clone Proposal Successful",
                                proposalsData?.title + " copied to " + data.title)
                        );
                    },
                    onError: (error) => {
                        notifyError("Clone Proposal Failed", getErrorMessage(error))
                    }});
                }
            },
            onError: (error) =>
                notifyError("Clone Proposal Failed", getErrorMessage(error))
        })
    }

    /**
     * create a delete button for a proposal.
     * @constructor
     */
    const DeleteProposal = () : ReactElement => {
        return DeleteButton(
            {
                toolTipLabel: "Removes this proposal permanently",
                disabled: false,
                onClick: confirmDeleteProposal,
                label: "Delete Proposal",
                variant: "outline",
                toolTipLabelPosition: "top"
            }
        )
    }

    /**
     * creates the modals for the deletion of a proposal.
     */
    const confirmDeleteProposal = () : void => {
        modals.openConfirmModal({
            title: "Confirm Proposal Deletion",
            centered: true,
            children: (
                <Stack>
                    <Text size={"sm"}>
                        Are you sure you want to permanently remove the
                        proposal `{proposalsData?.title!}`?
                    </Text>
                    <Text size={"sm"} c={"yellow.7"}>
                        This action cannot be undone.
                    </Text>
                </Stack>

            ),
            labels: {confirm: "Yes, delete this proposal",
                     cancel: "No, do not delete!"},
            confirmProps: {color: "red"},
            onConfirm: () => handleDeleteProposal()
        })
    }

    /**
     * handles the deletion of optical telescope data bits for this proposal.
     */
    const handleDeletionOfOpticalComponents = () => {
        if (selectedProposalCode !== undefined) {
            deleteProposalOpticalTelescopeMutation.mutate({
                proposalID: selectedProposalCode,
            }, {
                onSuccess: () => {
                    notifySuccess("Deletion successful",
                        "Proposal: '" + proposalsData?.title! +
                        "' has been removed");
                    navigate("/");

                    //workaround: usually you would invalidate queries
                    // however this causes this page to rerender with the
                    // now deleted 'selectedProposalCode'. The get proposal
                    //API call then fails and a 500 code shows up in the
                    // console.
                    props.forceUpdate();
                },
                onError: (error) => {
                    notifyError(
                        "Deletion of proposals optical telescope" +
                        " data failed", getErrorMessage(error))
                }
            })
        }
    }

    /**
     * handles deletion of proposal
     */
    const handleDeleteProposal = () => {
        deleteProposalMutation.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        },{
            onSuccess: () => {
                handleDeletionOfOpticalComponents();
            },
            onError: (error) =>
                notifyError("Deletion failed", getErrorMessage(error))
        })
    }

    /**
     * returns the HTML structure for the overview page.
     */
    return (
        <PanelFrame>
            <PanelHeader
                itemName={proposalsData?.title!}
                panelHeading={"Overview"}
                isLoading={proposalsIsLoading || opticalLoading}
            />
            <Container fluid>
                <ContextualHelpButton messageId="Overview" />
                <Fieldset legend={"Proposal Services"}>
                    <Group grow>
                        <ExportProposal/>
                        <CloneProposal/>
                        <DeleteProposal/>
                    </Group>
                </Fieldset>
                <Fieldset legend={"Proposal Overview"}>
                    <div ref={printRef}>
                        <DisplayTitle/>
                        <DisplayInvestigators/>
                        <DisplaySummary/>
                        <DisplayKind/>
                        <DisplayScientificJustification/>
                        <DisplayTechnicalJustification/>
                        <DisplayObservations/>
                        {polarisMode === POLARIS_MODES.OPTICAL && (
                            DisplayTelescopeSummary(selectedProposalCode)
                        )}
                        <DisplaySupportingDocuments/>
                        <DisplayRelatedProposals/>
                    </div>
                </Fieldset>
            </Container>
        </PanelFrame>
    );
}

export default OverviewPanel