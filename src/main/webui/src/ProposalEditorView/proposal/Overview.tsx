import {useNavigate, useParams} from 'react-router-dom'
import {
    useJustificationsResourceDownloadLatexPdf,
    useProposalResourceCloneObservingProposal,
    useProposalResourceDeleteObservingProposal,
    useProposalResourceGetObservingProposal,
    useSupportingDocumentResourceGetSupportingDocuments,
} from 'src/generated/proposalToolComponents';
import {
    Accordion,
    Avatar,
    Box,
    Container, Fieldset,
    Group,
    List, Stack,
    Table,
    Text,
} from '@mantine/core';
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse,
    Investigator, ObjectIdentifier,
    RealQuantity, Target,
} from 'src/generated/proposalToolSchemas.ts';
import { IconNorthStar } from '@tabler/icons-react';
import {ReactElement, useEffect, useRef} from 'react';
import downloadProposal from './downloadProposal.tsx';
import {DIMMED_FONT_WEIGHT, JSON_SPACES} from 'src/constants.tsx';
import { TargetTable } from '../targets/TargetTable.tsx';
import { TechnicalGoalsTable } from '../technicalGoals/technicalGoalTable.tsx';
import {PreviewJustification} from "../justifications/justification.preview.tsx";
import {ContextualHelpButton} from "../../commonButtons/contextualHelp.tsx"
import {notifyError, notifySuccess} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import DeleteButton from "../../commonButtons/delete.tsx";
import {PanelFrame, PanelHeader} from "../../commonPanel/appearance.tsx";
import {ExportButton} from "../../commonButtons/export.tsx";
import {modals} from "@mantine/modals";
import CloneButton from "../../commonButtons/clone.tsx";
import {useToken} from "../../App2.tsx";
import {useQueryClient} from "@tanstack/react-query";

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

    targetIds.map((targetId: any) => listOfTargets.push({dbid: targetId, code: proposalCode.toString()}))

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

    const { selectedProposalCode } = useParams();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const cloneProposalMutation =
        useProposalResourceCloneObservingProposal();

    const deleteProposalMutation =
        useProposalResourceDeleteObservingProposal()

    const supportingDocs =
        useSupportingDocumentResourceGetSupportingDocuments({
                pathParams: {
                    proposalCode: Number(selectedProposalCode)
                }
        });

    const compiledPdf = useJustificationsResourceDownloadLatexPdf({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        }
    )

    useEffect(() => {
        if(compiledPdf.status === 'success') {
            console.log("We got the pdf stream?");
            //console.log(compiledPdf);
        } else {

            console.log("We got " + compiledPdf.status);
        }
    }, [compiledPdf.data, compiledPdf.status]);



    // holder for the reference needed for the pdf generator to work.
    const printRef = useRef<HTMLInputElement>(null);

    const proposals =
        useProposalResourceGetObservingProposal({
                pathParams: {
                    proposalCode: Number(selectedProposalCode)
                }
        });


    if (proposals.error) {
        return (
            <Box>
                <pre>{JSON.stringify(proposals.error, null, JSON_SPACES)}</pre>
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
            <h1>{proposals.data?.title}</h1>
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
                    {proposals.data?.summary}
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
                <Text>{proposals.data?.kind}</Text>
            </>
        )
    }

    /**
     * handles the scientific justification panel
     * @return {React.ReactElement} the html for the scientific justification panel.
     * @constructor
     */
    const DisplayScientificJustification = (): ReactElement => {
        return (
            <>
                <h3>Scientific Justification</h3>
                {PreviewJustification(
                    proposals.data?.scientificJustification?.format!,
                    proposals.data?.scientificJustification?.text!)
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
                    proposals.data?.technicalJustification?.format!,
                    proposals.data?.technicalJustification?.text!)
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

        const investigators = proposals.data?.investigators?.map(
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
                    proposals.data?.investigators &&
                    proposals.data.investigators.length > 0 ?
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

        const documents = proposals.data?.supportingDocuments?.map((document) =>(
            <List.Item key={document.location}>{document.title}</List.Item>
        ))

        return (
            <>
                <h3>Supporting Documents</h3>
                {
                    proposals.data?.supportingDocuments &&
                    proposals.data.supportingDocuments.length > 0 ?
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

        const proposalList = proposals.data?.relatedProposals?.map((related) =>(
            <List.Item key={related.proposal?.xmlId}>
                {related.proposal?.title}
            </List.Item>
        ))

        return (
            <>
                <h3>Related Proposals</h3>
                {
                    proposals.data?.relatedProposals &&
                    proposals.data.relatedProposals.length > 0 ?
                        <List>
                            {proposalList}
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
            proposals.data?.observations?.map((observation, index) => {

                //observation.target and observation.technicalGoal are NOT objects
                // but numbers here, specifically their DB id

                //get all the target objects
                let targetObjs = [] as Target[];

                observation.target?.map((obsTarget) => {
                    let targetObj = proposals.data?.targets?.find((target) =>
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

                let remaining =  targetObjs.length - targetIndex;

                if(remaining > 0) {
                    targetNames += ", and " + remaining + " more";
                }

                let technicalGoalObj  = proposals.data?.technicalGoals?.find((techGoal) =>
                    techGoal._id === observation.technicalGoal)!

                let observationType = observation["@type"] === 'proposal:TargetObservation' ?
                    'Target Obs.' : 'Calibration Obs.';

                // Ideally we should use the observation id for the 'key' but we don't have it at this point,
                // so we use the map index instead
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
                    proposals.data?.observations &&
                    proposals.data.observations.length > 0 ?
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
     * generates the overview pdf and saves it to the users disk.
     *
     * code extracted from: https://www.robinwieruch.de/react-component-to-pdf/
     * @return {Promise<void>} promise that the pdf will be saved at some point.
     */
    const handleDownloadPdf = (): void => {
        downloadProposal(
            printRef.current!,
            proposals.data!,
            supportingDocs.data!,
            selectedProposalCode!,
            authToken
        );
    };

    const CloneProposal = (): ReactElement => {
        return CloneButton(
            {
                toolTipLabel: `creates a new proposal from a deep copy of this proposal`,
                disabled: false,
                onClick: handleCloneProposal,
                label: "Clone Proposal",
                variant: "filled",
                toolTipLabelPosition: "top"
            }
        )
    }

    const handleCloneProposal = (): void => {
        cloneProposalMutation.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        }, {
            onSuccess: (data) => {
                queryClient.invalidateQueries({
                    queryKey: ['pst', 'api', 'proposals']
                }).then(() =>
                    notifySuccess("Clone Proposal Successful",
                        proposals.data?.title + " copied to " + data.title)
                );
            },
            onError: (error) =>
                notifyError("Clone Proposal Failed", getErrorMessage(error))
        })
    }

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


    const confirmDeleteProposal = () : void => {
        modals.openConfirmModal({
            title: "Confirm Proposal Deletion",
            centered: true,
            children: (
                <Stack>
                    <Text size={"sm"}>
                        Are you sure you want to permanently remove the proposal '{proposals.data?.title!}'?
                    </Text>
                    <Text size={"sm"} c={"yellow.7"}>
                        This action cannot be undone.
                    </Text>
                </Stack>

            ),
            labels: {confirm: "Yes, delete this proposal", cancel: "No, do not delete!"},
            confirmProps: {color: "red"},
            onConfirm: () => handleDeleteProposal()
        })
    }


    const handleDeleteProposal = () => {

        deleteProposalMutation.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)}
        },{
            onSuccess: () => {
                notifySuccess("Deletion successful",
                    "Proposal: '" + proposals.data?.title! + "' has been removed");
                navigate("/");

                //workaround: usually you would invalidate queries however this causes this
                //page to rerender with the now deleted 'selectedProposalCode'. The get proposal
                //API call then fails and a 500 code shows up in the console.
                props.forceUpdate();
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
                itemName={proposals.data?.title!}
                panelHeading={"Overview"}
                isLoading={proposals.isLoading}
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
                        {!compiledPdf.isLoading && compiledPdf.data &&
                            //ts-@ignore
                        <object data={window.URL.createObjectURL(compiledPdf.data)}
                                width="100%"
                                height="100%">
                            <p>Here it is</p>
                        </object>}
                        <DisplayObservations/>
                        <DisplaySupportingDocuments/>
                        <DisplayRelatedProposals/>
                    </div>
                </Fieldset>
            </Container>
        </PanelFrame>
    );

}

export default OverviewPanel