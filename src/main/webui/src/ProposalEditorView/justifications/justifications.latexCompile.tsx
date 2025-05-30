import {ReactElement, useState} from "react";
import {Button, Checkbox, Fieldset, Group, Loader, Modal, Tooltip} from "@mantine/core";
import {CLOSE_DELAY, OPEN_DELAY} from "../../constants.tsx";
import {IconArrowBigRightLines} from "@tabler/icons-react";
import {notifyError} from "../../commonPanel/notifications.tsx";
import getErrorMessage from "../../errorHandling/getErrorMessage.tsx";
import {useJustificationsResourceCreatePDFLaTex} from "../../generated/proposalToolComponents.ts";
import {useParams} from "react-router-dom";
import {useDisclosure} from "@mantine/hooks";
import JustificationsLatexStatus from "./justifications.latexStatus.tsx";

export default
function JustificationsLatexCompile() : ReactElement {

    const { selectedProposalCode } = useParams();

    const [warningsAsErrors, setWarningsAsErrors] = useState(true)
    const [loading, setLoading] = useState(false)
    const [latexStatus, setLatexStatus] = useState("")

    const compileLaTeXOutput =
        useJustificationsResourceCreatePDFLaTex();

    const [opened, {close, open}] = useDisclosure();

    const handleCompile = () => {
        setLoading(true);

        compileLaTeXOutput.mutate({
            pathParams: {proposalCode: Number(selectedProposalCode)},
            queryParams: {warningsAsErrors: warningsAsErrors}
        }, {
            onSuccess: (data) => {
                setLoading(false);
                setLatexStatus(data as unknown as string);
                open();
            },
            onError: (error) => {
                setLoading(false); // otherwise spins FOREVER after error
                notifyError("Server error", getErrorMessage(error))
            }
        })
    }

    const LatexStatusModal = () : ReactElement => {
        return (
            <Modal
                opened={opened}
                onClose={close}
                title={"LaTeX Compilation Status"}
                closeOnClickOutside={false}
                size={"40%"}
            >
                <JustificationsLatexStatus latexStatus={latexStatus}/>
            </Modal>
        )
    }

    return (
        <Fieldset legend={"Compile Document"}>
            <Group grow>
                <Tooltip
                    label={"Compile to PDF"}
                    openDelay={OPEN_DELAY}
                    closeDelay={CLOSE_DELAY}
                >
                    <Button
                        rightSection={<IconArrowBigRightLines />}
                        onClick={handleCompile}
                        color={"green"}
                    >
                        {
                            loading ? <Loader size={"sm"}/> :
                                "Compile to PDF"
                        }
                    </Button>
                </Tooltip>
                <Checkbox
                    description={"Warnings as errors (recommended)"}
                    checked={warningsAsErrors}
                    onChange={(event)=> {
                        setWarningsAsErrors(event.currentTarget.checked)
                    }}
                />
            </Group>
            <LatexStatusModal/>
        </Fieldset>
    )
}