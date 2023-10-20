import { useParams } from "react-router-dom"
import {
    useProposalResourceGetObservingProposal,
} from "../generated/proposalToolComponents";
import {Accordion, Avatar, Badge, Box, Container, Group, List, Table, Text} from "@mantine/core";
import {
    CalibrationObservation,
    CalibrationTargetIntendedUse,
    Investigator, RealQuantity
} from "../generated/proposalToolSchemas.ts";
import {randomId} from "@mantine/hooks";
import {RenderTarget} from "../targets/RenderTarget.tsx";
import {IconNorthStar} from "@tabler/icons-react";
import {RenderTechnicalGoal} from "../technicalGoals/render.technicalGoal.tsx";

// needs styling work

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



interface InvestigatorLabelProps {
    fullName: string;
    role: string;
    home: string;
}

function InvestigatorAccordionLabel({fullName, role, home} : InvestigatorLabelProps) {
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
function InvestigatorAccordionContent(investigator : Investigator) {
    return (
        <Table>
            <Table.Tbody>
                <Table.Tr>
                    <Table.Td>for phd?</Table.Td><Table.Td>{investigator.forPhD ? 'yes' : 'no'}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>email</Table.Td><Table.Td>{investigator.person?.eMail}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>orcid ID</Table.Td><Table.Td>{investigator.person?.orcidId?.value}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Td>Institute address</Table.Td><Table.Td>{investigator.person?.homeInstitute?.address}</Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    )
}

interface ObservationLabelProps {
    targetName: string;
    observationType: string;
    intendedUse?: CalibrationTargetIntendedUse;
    spectralPoint: RealQuantity;
}

function ObservationAccordionLabel({targetName, observationType, intendedUse, spectralPoint} : ObservationLabelProps) {
    return(
        <Group wrap={"nowrap"}>
            <Avatar radius={"sm"}>
                <IconNorthStar size={"1rem"}/>
            </Avatar>
            <div>
                <Text>{targetName}</Text>
                <Text size={"sm"} c={"dimmed"} fw={400}>
                    {observationType} {intendedUse && "| " + intendedUse.toLowerCase()} | {spectralPoint.value} {spectralPoint.unit?.value}
                </Text>
            </div>
        </Group>
    )
}

interface ObservationContentProps {
    proposalCode: number;
    targetId: number;
    technicalGoalId: number;
}

function ObservationAccordionContent({proposalCode, targetId, technicalGoalId} : ObservationContentProps) {
    return (
        //TODO: consider a Grid instead of Group
        <Group>
            <RenderTarget proposalCode={proposalCode} dbid={targetId} showRemove={false} />
            <RenderTechnicalGoal proposalCode={proposalCode} dbid={technicalGoalId} />
        </Group>
    )
}


function OverviewPanel() {

    const { selectedProposalCode } = useParams();

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

    const DisplayTitle = () => {
        return (
            <h1>{proposalsData?.title}</h1>
        )
    }

    const DisplaySummary = () => {
        return (
            <>
                <h3>Summary</h3>
                <Text>{proposalsData?.summary}</Text>
            </>
        )
    }

    const DisplayKind = () => {
        return (
            <>
                <h3>Kind</h3>
                <Text>{proposalsData?.kind}</Text>
            </>
        )
    }

    const DisplaySubmitted = () => {
        return (
            <Group>
                <h4>Submitted:</h4>
                <Text>{proposalsData?.submitted ? 'yes' : 'no'}</Text>
            </Group>
        )
    }

    const DisplayScientificJustification = () => {
        return (
            <>
                <h3>Scientific Justification</h3>
                <Badge>{proposalsData?.scientificJustification?.format}</Badge>
                <Text>{proposalsData?.scientificJustification?.text}</Text>
            </>
        )
    }

    const DisplayTechnicalJustification = () => {
        return (
            <>
                <h3>Technical Justification</h3>
                <Badge>{proposalsData?.technicalJustification?.format}</Badge>
                <Text>{proposalsData?.technicalJustification?.text}</Text>
            </>
        )
    }

    const DisplayInvestigators = () => {

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

    const DisplaySupportingDocuments = () => {

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

    const DisplayRelatedProposals = () => {

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


    //FIXME: need to fetch the required data (targets, technical goals, ...) at the top of this function
    const DisplayObservations = () => {

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

    return (
        <>
            {
                proposalsIsLoading ? 'Loading...' :
                    <Container fluid>
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

                    </Container>

            }

        </>
    );

}

export default OverviewPanel