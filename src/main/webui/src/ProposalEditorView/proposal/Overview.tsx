import {useNavigate, useParams} from 'react-router-dom'
import {
    useProposalResourceCloneObservingProposal,
    useProposalResourceDeleteObservingProposal,
    useProposalResourceGetObservingProposal,
    useSupportingDocumentResourceGetSupportingDocuments,
} from 'src/generated/proposalToolComponents';
import {Accordion, Avatar, Box, Container, Fieldset, Group, List, Space, Stack, Table, Text,} from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse,
    Investigator,
    ObjectIdentifier,
    RealQuantity,
    Target,
} from 'src/generated/proposalToolSchemas.ts';
import {IconNorthStar} from '@tabler/icons-react';
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
    TelescopeOverviewTableState,
    useOpticalOverviewTelescopeTableData,
    useOpticalTelescopeResourceDeleteProposalTelescopeData,
} from "../../util/telescopeComms";
import {ProposalContext, useToken} from "../../App2";
import {observationOpticalTableHeader} from "../observations/optical/observationOpticalTable";

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
 * @param ObservationLabelProps: the data for the method.
 * @return {ReactElement} the htm for the observation accordion label.
 * @constructor
 */
function ObservationAccordionLabel(
    {targetName, observationType, intendedUse, spectralPoint} :
        ObservationLabelProps): ReactElement {
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
 * interface for the observation content props.
 * @param {number} proposalCode: the proposal code.
 * @param {number} targetID the target id in the database.
 * @param {number} technicalGoalId the technical goal id in the database.
 */
interface ObservationContentProps {
    proposalCode: number;
    targetIds: number[];
    technicalGoalId: number;
}

/**
 * generates the observation accordion content.
 * @param ObservationContentProps: data for the method.
 * @return {ReactElement} the html for the observation accordion content.
 * @constructor
 */
function ObservationAccordionContent(
    {proposalCode, targetIds, technicalGoalId} : ObservationContentProps) :
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

    const {data: supportingDocs} =
        useSupportingDocumentResourceGetSupportingDocuments({
            pathParams: {
                proposalCode: Number(selectedProposalCode)
            }
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
            <List.Item key={related.proposal?._id}>
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
     * creates the observations panel for the overview page.
     *
     * @return ReactElement the generated HTML for the observations panel.
     * @constructor
     */
    const DisplayObservations = (): ReactElement => {
        const observations =
            proposalsData?.observations?.map((observation, index) => {

                //observation.target and observation.technicalGoal are NOT
                // objects but numbers here, specifically their DB id

                //get all the target objects
                const targetObjs = [] as Target[];

                observation.target?.map((obsTarget) => {
                    const targetObj = proposalsData?.targets?.find((target) =>
                        target._id === obsTarget)!

                    targetObjs.push(targetObj);
                });

                // create a string of the first target names
                let targetNames = targetObjs[0].sourceName!;
                let targetIndex = 0;

                while(++targetIndex < 3
                && targetIndex < targetObjs.length) {
                    targetNames += ", " + targetObjs[targetIndex].sourceName;
                }

                const remaining =  targetObjs.length - targetIndex;

                if(remaining > 0) {
                    targetNames += ", and " + remaining + " more";
                }

                const technicalGoalObj =
                    proposalsData?.technicalGoals?.find((techGoal) =>
                        techGoal._id === observation.technicalGoal)!

                const observationType =
                    observation["@type"] === 'proposal:TargetObservation' ?
                        'Target Obs.' : 'Calibration Obs.';

                // Ideally we should use the observation id for the 'key' but
                // we don't have it at this point, so we use the map index
                // instead
                return(
                    <Accordion.Item key={index} value={String(index)}>
                        <Accordion.Control>
                            <ObservationAccordionLabel
                                targetName={targetNames}
                                observationType={observationType}
                                intendedUse={observationType === 'Calibration Obs.' ?
                                    (observation as CalibrationObservation).intent : undefined}
                                spectralPoint={technicalGoalObj.performance?.representativeSpectralPoint!}
                            />
                        </Accordion.Control>
                        <Accordion.Panel>
                            <ObservationAccordionContent
                                proposalCode={Number(selectedProposalCode)}
                                targetIds={observation.target as number []}
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
     * returns the header for the observation optical table.
     *
     * @return {React.ReactElement} the html for the table header.
     */
    function observationOpticalTableHeader(): ReactElement {
        return (
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Telescope Name</Table.Th>
                    <Table.Th>Telescope Instrument</Table.Th>
                    <Table.Th>Telescope Time Requirement</Table.Th>
                    <Table.Th>Telescope Condition</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
        );
    }

    /**
     * builds a row data.
     *
     * @param row: the row.
     * @param key: the key.
     */
    const OpticalBasicRow =
            (row: TelescopeOverviewTableState, key: string): ReactElement => {
        return (
            <Table.Tr key={"observation:" + key}>
                <Table.Td>{row.telescopeName}</Table.Td>
                <Table.Td>{row.instrumentName}</Table.Td>
                <Table.Td>{row.telescopeTimeValue}  {row.telescopeTimeUnit}</Table.Td>
                <Table.Td>{row.condition}</Table.Td>
                {/* Add more Table.Td elements based on the properties of TelescopeOverviewTableState */}
            </Table.Tr>
        )
    }

    function OpticalSummaryRow(
            data: Map<string, TelescopeOverviewTableState>): ReactElement {
        return <></>
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

        // handle any errors
        if(opticalError) {
            return (
                <Container>
                    Unable to load optical data:
                    {getErrorMessage(opticalError)}
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



        return (
            <>
                <h3>Telescopes</h3>
                <Table>
                    { observationOpticalTableHeader() }
                    <Table.Tbody>
                        {opticalData && Array.from(opticalData.entries()).map(
                            ([key, obj]) => (
                                OpticalBasicRow(obj, key)
                            ))}
                        {opticalData && OpticalSummaryRow(opticalData)}
                    </Table.Tbody>
                </Table>
            </>
        );
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
            onSuccess: (data) => {
                queryClient.invalidateQueries({
                    queryKey: ['pst', 'api', 'proposals']
                }).then(() =>
                    notifySuccess("Clone Proposal Successful",
                        proposalsData?.title + " copied to " + data.title)
                );
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
                isLoading={proposalsIsLoading}
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