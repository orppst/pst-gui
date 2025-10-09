import {ReactElement, useContext, useEffect, useState} from "react";
import {Fieldset, Stack, Text} from "@mantine/core";
import {useParams} from "react-router-dom";
import {EditorPanelHeader, PanelFrame} from "../../commonPanel/appearance.tsx";
import SubmissionForm from "./submission.form.tsx";
import {ProposalContext} from "../../App2.tsx";
import {useInvestigatorResourceGetInvestigatorsAsObjects} from "../../generated/proposalToolComponents.ts";
import AlertErrorMessage from "../../errorHandling/alertErrorMessage.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";

export type ObservationModeTuple = {
    observationId: number,
    observationName: string,
    observationType: string,
    modeId: number,
    modeName: string
}

export interface SubmissionFormValues {
    selectedCycle: number
    selectedModes: ObservationModeTuple[]
}

export default
function SubmitPanel(): ReactElement {
    const {selectedProposalCode} = useParams();

    const { user } = useContext(ProposalContext);

    const [isUserPi, setIsUserPi] = useState(false);

    const investigators = useInvestigatorResourceGetInvestigatorsAsObjects({
        pathParams: { proposalCode: Number(selectedProposalCode) }
    })

    useEffect(() => {
        if(investigators.status === 'success'){
            investigators.data?.map((investigator) => {
                if(investigator.person?._id == user._id
                    && investigator.type == "PI")
                    setIsUserPi(true);
            })
        }
    }, [investigators.status])

    if(investigators.isError) {
        return(
            <AlertErrorMessage
                title={"Failed to check principle investigator"}
                error={getErrorMessage(investigators.error)}
            />
        )
    }

    if(isUserPi)
        return (
            <PanelFrame>
                <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Submit"} />
                <Stack>
                    <Fieldset legend={"Submission Form"}>
                        <SubmissionForm/>
                    </Fieldset>
                </Stack>
            </PanelFrame>
        )
    else
        return (
            <PanelFrame>
                <EditorPanelHeader proposalCode={Number(selectedProposalCode)} panelHeading={"Submit"} />
                <Text size={'lg'}>Only a PI can submit or withdraw this proposal</Text>
            </PanelFrame>
        )
}
