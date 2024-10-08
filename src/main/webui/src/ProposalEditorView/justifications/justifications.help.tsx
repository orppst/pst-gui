import {ReactElement} from "react";
import {Alert, Container, ScrollArea, Space, Text} from "@mantine/core";
import {IconInfoHexagon} from "@tabler/icons-react";

export default
function JustificationsHelp() : ReactElement {
    return (
        <>
            <Alert
                variant={"light"}
                title={"Help text Work-In-Progress"}
                color={"blue"}
                icon={<IconInfoHexagon/>}
                mx={50}
                mb={30}
            >
                This text is a work-in-progress.
                As such it should not be taken verbatim. Thank you for your attention.
            </Alert>

            <Container mx={100}>
                <ScrollArea h={515} offsetScrollbars scrollbars={"y"}>
                    <Text size={"lg"} c={"orange"} fw={700}>
                        Justification Flavours
                    </Text>
                    <Space h={"md"}/>
                    <Text size={"sm"}>
                        Justifications come in two flavours: 'scientific' and 'technical'.

                        The 'scientific' justification should include all the physics reasons why you
                        want to perform the observation(s) specified in this proposal. Whereas, the
                        'technical' justification should outline the reasons for your choice of observatory,
                        and their capabilities to achieve the technical goals you've set.
                    </Text>

                    <Space h={"xl"}/>

                    <Text size={"lg"} c={"orange"} fw={700}>
                        LaTeX Specifics
                    </Text>
                    <Space h={"md"}/>
                    <Text size={"sm"}>
                        To select a LaTex Format simply select the relevant radio button. This will
                        switch on LaTeX syntax highlighting in the <Text span fs={"italic"} c={"blue"}>Editor</Text>.
                        The text that you supply will now be saved as 'main.tex' in the backend.
                        Any image files (.png,.jpg) and any bibtex (.bib) that you reference must be
                        uploaded to our service. This can be done in
                        the <Text span fs={"italic"} c={"blue"}>Latex Service</Text> tab of this window.
                    </Text>
                    <Space h={"md"}/>
                    <Text size={"sm"}>
                        Once you are satisfied that all resource files have been uploaded, you may
                        attempt to compile your LaTeX source into a PDF by pressing the "Compile to PDF"
                        button. If successful, you will receive a message to that effect in the text area
                        below the compile button, and the "Request PDF download" button will enable.
                        Pressing this button prepares your download, and once complete changes to the
                        "Download" button to actually download the PDF.
                    </Text>
                    <Space h={"md"}/>
                    <Text size={"sm"}>
                        If the LaTeX compilation fails then the text area will display a list of errors,
                        and optionally warnings, that you will have to fix. These are usually caused by typos
                        in the LaTeX source file and/or missing resource files. We recommend you treat warnings
                        as errors.
                    </Text>
                </ScrollArea>
            </Container>



        </>
    )
}