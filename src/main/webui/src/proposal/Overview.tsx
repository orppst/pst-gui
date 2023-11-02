import { useParams } from 'react-router-dom'
import {
    useProposalResourceGetObservingProposal,
    useSupportingDocumentResourceGetSupportingDocuments,
} from '../generated/proposalToolComponents';
import { Accordion, Avatar, Badge, Box, Container, Group, List, Table, Text } from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse,
    Investigator,
    RealQuantity
} from '../generated/proposalToolSchemas.ts';
import { randomId } from '@mantine/hooks';
import { RenderTarget } from '../targets/RenderTarget.tsx';
import { IconNorthStar } from '@tabler/icons-react';
import { RenderTechnicalGoal } from '../technicalGoals/render.technicalGoal.tsx';
import { ReactElement, useRef } from 'react';
import { SaveButton } from '../commonButtons/save.tsx';
import downloadProposal from './downloadProposal.tsx';

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
        list of strings use a List
        list of objects use an Accordion

        TODO: provide a means to download the 'proposal' as a zipped/tar balled file containing a PDF
        of the overview plus the supporting document files
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

/**
 *
 * @param an InvestigatorLabelProps object.
 * @return {ReactElement} the html to present a given investigator.
 * @constructor
 */
function InvestigatorAccordionLabel({fullName, role, home} : InvestigatorLabelProps): ReactElement {
    return (
        <Group wrap={"nowrap"}>
            <Avatar radius={"md"} />
            <div>
                <Text>{fullName}</Text>
                <Text size={"sm"} c={"dimmed"} fw={400}>
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
function InvestigatorAccordionContent(investigator : Investigator): ReactElement {
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
 * @param {RealQuantity} spectralPoint the spectral point.
 */
interface ObservationLabelProps {
    targetName: string;
    observationType: string;
    intendedUse?: CalibrationTargetIntendedUse;
    spectralPoint: RealQuantity;
}

/**
 * creates the observation label.
 * @param {string} targetName the target name.
 * @param {string} observationType the observation type.
 * @param {"AMPLITUDE" | "ATMOSPHERIC" | "BANDPASS" | "PHASE" |
 *         "POINTING" | "FOCUS" | "POLARIZATION" | "DELAY" |
 *         undefined} intendedUse the intended use.
 * @param {RealQuantity} spectralPoint the spectral point.
 * @return {ReactElement} the htm for the observation accordion label.
 * @constructor
 */
function ObservationAccordionLabel(
    {targetName, observationType, intendedUse, spectralPoint} :
        ObservationLabelProps): ReactElement {
    return(
        <Group wrap={"nowrap"}>
            <Avatar radius={"sm"}>
                <IconNorthStar size={"1rem"}/>
            </Avatar>
            <div>
                <Text>{targetName}</Text>
                <Text size={"sm"} c={"dimmed"} fw={400}>
                    {observationType}
                    {intendedUse && "| " + intendedUse.toLowerCase()} |
                    {spectralPoint.value} {spectralPoint.unit?.value}
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
interface ObservationContentProps {
    proposalCode: number;
    targetId: number;
    technicalGoalId: number;
}

/**
 * generates the observation accordion content.
 * @param {number} proposalCode the proposal code.
 * @param {number} targetId the target id in the database.
 * @param {number} technicalGoalId the technical goal id in the database.
 * @return {ReactElement} the html for the observation accordion content.
 * @constructor
 */
function ObservationAccordionContent(
    {proposalCode, targetId, technicalGoalId} : ObservationContentProps) :
    ReactElement {
    return (
        //TODO: consider a Grid instead of Group
        <Group>
            <RenderTarget proposalCode={proposalCode} dbid={targetId} showRemove={false} />
            <RenderTechnicalGoal proposalCode={proposalCode} dbid={technicalGoalId} />
        </Group>
    )
}

/**
 * creates the html for the overview panel.
 * @return {ReactElement} the html of the overview panel.
 * @constructor
 */
function OverviewPanel(): ReactElement {
    const { selectedProposalCode } = useParams();

    const {data} =
        useSupportingDocumentResourceGetSupportingDocuments(
            {pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true});

    // holder for the reference needed for the pdf generator to work.
    const printRef = useRef<HTMLInputElement>(null);

    const { data: proposalsData , error: proposalsError, isLoading: proposalsIsLoading } =
        useProposalResourceGetObservingProposal({
                pathParams: {proposalCode: Number(selectedProposalCode)},},
            {enabled: true}
        );


    if (proposalsError) {
        return (
            <Box>
                <pre>{JSON.stringify(proposalsError, null, 2)}</pre>
            </Box>
        );
    }

    /**
     * generates the overview pdf and saves it to the users disk.
     *
     * code extracted from: https://www.robinwieruch.de/react-component-to-pdf/
     * @return {Promise<void>} promise that the pdf will be saved at some point.
     */
    const handleDownloadPdf = (): void => {
        // get the overview page to print as well as the proposal data.
        const element = printRef.current;

        // ensure there is a rendered overview.
        if(element !== null && proposalsData !== undefined && selectedProposalCode !== undefined && data !== undefined) {
            downloadProposal(element, proposalsData, data, selectedProposalCode).then();
        } else {
            // something failed in the rendering of the overview react element or
            // extracting the proposal data.
            if (element === null) {
                console.error(
                    'Tried to download a Overview that had not formed correctly.');
            } else {
                console.error(
                    'Tried to download the proposal data and that had not formed correctly.');
            }
        }
    };

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
                <Text>{proposalsData?.summary}</Text>
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
     * generates the display submitted panel.
     * @return {React.ReactElement} the html for the submitted display.
     * @constructor
     */
    const DisplaySubmitted = (): ReactElement => {
        return (
            <Group>
                <h4>Submitted:</h4>
                <Text>{proposalsData?.submitted ? 'yes' : 'no'}</Text>
            </Group>
        )
    }

    /**
     * handles the scientific justification panel.
     * @return {React.ReactElement} the html for the scientific justification panel.
     * @constructor
     */
    const DisplayScientificJustification = (): ReactElement => {
        return (
            <>
                <h3>Scientific Justification</h3>
                <Badge>{proposalsData?.scientificJustification?.format}</Badge>
                <Text>{proposalsData?.scientificJustification?.text}</Text>
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
                <Badge>{proposalsData?.technicalJustification?.format}</Badge>
                <Text>{proposalsData?.technicalJustification?.text}</Text>
            </>
        )
    }

    /**
     * generates the HTML for the investigators for the overview page.
     * @return {ReactElement} the html for the investigators.
     * @constructor
     */
    const DisplayInvestigators = (): ReactElement => {

        const investigators = proposalsData?.investigators?.map((investigator) => (
            <Accordion.Item key={investigator.person?.orcidId?.value} value={investigator.person?.fullName!}>
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
                    proposalsData?.investigators && proposalsData.investigators.length > 0 ?
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
                    proposalsData?.supportingDocuments && proposalsData.supportingDocuments.length > 0 ?
                        <List>
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
            <List.Item key={related.proposal?._id}>{related.proposal?.title}</List.Item>
        ))

        return (
            <>
                <h3>Related Proposals</h3>
                {
                    proposalsData?.relatedProposals && proposalsData.relatedProposals.length > 0 ?
                        <List>
                            {proposals}
                        </List> :
                        <Text c={"yellow"}>No related proposals added</Text>
                }
            </>
        )
    }

    /**
     * creates the observations panel for the overview page.
     *
     * @return ReactElement the generated HTML for the observations panel.
     * @constructor
     */
    const DisplayObservations = (): ReactElement => {

        const observations = proposalsData?.observations?.map((observation) => {

            //observation.target and observation.technicalGoal are NOT objects but numbers here,
            // specifically their DB id

            let targetObj = proposalsData?.targets?.find((target) =>
                target._id === observation.target)!

            let technicalGoalObj  = proposalsData?.technicalGoals?.find((techGoal) =>
                techGoal._id === observation.technicalGoal)!

            let observationType = observation["@type"] === 'proposal:TargetObservation' ?
                'Target Obs.' : 'Calibration Obs.';

            return(
                <Accordion.Item key={randomId()} value={targetObj.sourceName!}>
                    <Accordion.Control>
                        <ObservationAccordionLabel
                            targetName={targetObj.sourceName!}
                            observationType={observationType}
                            intendedUse={observationType === 'Calibration Obs.' ?
                                (observation as CalibrationObservation).intent : undefined}
                            spectralPoint={technicalGoalObj.performance?.representativeSpectralPoint!}
                        />
                    </Accordion.Control>
                    <Accordion.Panel>
                        <ObservationAccordionContent
                            proposalCode={Number(selectedProposalCode)}
                            targetId={targetObj._id!}
                            technicalGoalId={technicalGoalObj._id!}
                        />
                    </Accordion.Panel>
                </Accordion.Item>
            )
        })

        return (
            <>
                <h3>Observations</h3>
                {
                    proposalsData?.observations && proposalsData.observations.length > 0 ?
                        <Accordion>
                            {observations}
                        </Accordion> :
                        <Text c={"yellow"}>No observations added</Text>
                }
            </>
        )
    }

    /**
     * add download button for the proposal to be extracted as a tar ball.
     *
     * @return {ReactElement} the html which contains the download button.
     * @constructor
     */
    const DownloadButton = (): ReactElement => {
        return SaveButton(
            {
                toolTipLabel: `download proposal`,
                disabled: false,
                onClick: handleDownloadPdf,
            });
    }

    /**
     * returns the HTML structure for the overview page.
     */
    return (
        <>
            {
                proposalsIsLoading ? 'Loading...' :
                    <Container fluid>
                        <DownloadButton/>
                        <div ref={printRef}>
                            <DisplayTitle/>
                            <DisplayInvestigators/>
                            <DisplaySummary/>
                            <DisplayKind/>
                            <DisplayScientificJustification/>
                            <DisplayTechnicalJustification/>
                            <DisplayObservations/>
                            <DisplaySupportingDocuments/>
                            <DisplayRelatedProposals/>
                            <DisplaySubmitted/>
                        </div>
                    </Container>
            }
        </>
    );

}

export default OverviewPanel