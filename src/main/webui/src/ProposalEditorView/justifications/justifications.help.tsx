import {ReactElement} from "react";
import {Container, List, ScrollArea, Stack, Text} from "@mantine/core";
import {MAX_CHARS_FOR_JUSTIFICATION} from "../../constants.tsx";

export default
function JustificationsHelp(
    {vpHeight} : {vpHeight: number}
) : ReactElement {

    const oneFigure = "\n\\onefigure[width]{filename}{caption}";
    const twoFigures = "\n\\twofigures[width]{filename1}{filename2}{caption}";
    const threeFigures = "\n\\threefigures[width]{filename1}{filename2}{filename3}{caption}";
    const fourFigures = "\n\\fourfigures[width]{filename1}{filename2}{filename3}{filename4}{caption}";
    const textWrapFigures = "\n\\textwrapfigure[width]{filename}{caption}{position}";
    const reference = "\n~\\ref{fig:filename}";

    return (
        <Container>
            <ScrollArea h={vpHeight * 0.75} offsetScrollbars scrollbars={"y"}>
                <Stack>
                    {MAX_CHARS_FOR_JUSTIFICATION < 8000 &&
                        <Text size={"sm"} c={'red'}>
                            There is currently a limit of {MAX_CHARS_FOR_JUSTIFICATION} characters set for both
                            the scientific and technical justifications.
                        </Text>
                    }
                    <Text size={"lg"} c={"orange"} fw={700}>
                        Justification Flavours
                    </Text>
                    <Text size={"sm"}>
                        Justifications come in two flavours: 'scientific' and 'technical'.

                        The 'scientific' justification should include all the physics reasons why you
                        want to perform the observation(s) specified in this proposal. Whereas, the
                        'technical' justification should outline the reasons for your choice of observatory,
                        and their capabilities to achieve the technical goals you've set. (Choice of
                        observatory is made when submitting the proposal. If you wish to submit this
                        proposal to multiple observatories, you will likely need to edit the 'technical'
                        justification to tailor it to each observatory.)
                    </Text>

                    <Text size={"lg"} c={"orange"} fw={700}>
                        LaTeX
                    </Text>
                    <Text size={"sm"}>
                        The text that you supply for both justifications will be inserted into a template
                        LaTex file saved as 'main.tex' in the backend. The text is inserted under a relevant
                        LaTex 'section' heading. You may use any LaTeX commands in your text that are available
                        to use under a 'section' heading. Indeed, to cite references you should use the '~\cite'
                        command in your text and provide a (single) bibtex file (.bib) as a "Resource File".
                    </Text>
                    <Text size={"sm"} c={'yellow'}>
                        Any image files (.png,.jpg,.eps,.pdf) that you reference must be uploaded to our service
                        as a "Resource File". You must also supply a single bibtex file (.bib) containing your
                        references as a resource file. Please note that "Resource Files" are also "Supporting Documents"
                        so will show up in the Documents list, where you may
                        download them, should you so wish.
                    </Text>
                    <Text size={"sm"}>
                        To make the insertion of figures into your document easier, we have provided custom
                        functions in the template file. These are namely:
                    </Text>

                    <List size={"sm"}>
                        <List.Item>{oneFigure}</List.Item>
                        <List.Item>{twoFigures}</List.Item>
                        <List.Item>{threeFigures}</List.Item>
                        <List.Item>{fourFigures}</List.Item>
                        <List.Item>{textWrapFigures}</List.Item>
                    </List>

                    <Text size={"sm"}>
                        The 'width' parameter is optional but if provided should a decimal number between 0
                        and 1, defining the width of the figure in terms of the text-width. It defaults to
                        0.5 for the single figure cases, and is an even division of the total text-width for
                        the multiple figure cases. If supplied, the width parameter for the multiple figure
                        cases applies to each of the images in the figure, rather than the whole figure itself.
                        The 'filename' parameter should match the name of the image file that you wish to
                        insert, excluding the dot extension.
                    </Text>
                    <Text size={"sm"}>
                        Notice that the two figure and three figure functions will place the images in a
                        single row, whereas the four figure function will place the images in a two-by-two
                        arrangement.The astute among you will have deduced then that the product of the width
                        value with the number of figures must not exceed one, else the figures will overflow
                        the text. In the case of the four-figure command due to the two-by-two arrangement,
                        two times the width parameter must not exceed one. For the multiple figure functions,
                        each image will be labelled '(a)' through to '(d)' where appropriate.
                    </Text>
                    <Text size={"sm"}>
                        For the 'textwrapfigure' command an additional parameter specifies the position of
                        the figure you want to text-wrap. Either 'l' or 'L' for the image on the left,
                        or 'r' or 'R' for the image on the right. The uppercase version allows the image to
                        float, whereas the lowercase version means exactly here. (Our command uses the
                        'wrapfigure' environment from the 'wrapfig' package).
                    </Text>

                    <Text size={"sm"}>
                        To reference a figure in your text, use the following syntax:
                    </Text>

                    <List size={"sm"}>
                        <List.Item>{reference}</List.Item>
                    </List>

                    <Text size={"sm"}>
                        The 'filename' parameter should be the name of the image file that you wish to
                        reference. For multiple figure cases, the 'filename' should be the name of the
                        of the first filename parameter. Of course, you can choose not to use these functions
                        and instead use the standard LaTeX commands for inserting figures.
                    </Text>

                    <Text size={"sm"}>
                        Please note that image formats are restricted to '.jpg', '.png', '.eps', and '.pdf'.
                    </Text>
                    <Text size={"sm"}>
                        Be aware that uploading an image file with the same filename as an existing file
                        will overwrite that file, and there will be no warning. You cannot have multiple
                        bibtex files.
                    </Text>
                    <Text size={"sm"}>
                        Once you are satisfied that all resource files have been uploaded, you may
                        attempt to compile your LaTeX source into a PDF by clicking the "Compile to PDF"
                        button. After a short delay waiting for the compilation to complete on the server,
                        a modal will open displaying the status of the compilation.
                    </Text>
                    <Text size={"sm"}>
                        If successful, you will receive a message to that effect in the modal, and the
                        "Download PDF" button at the bottom of the modal will be enabled.
                        Clicking this button downloads the resulting PDF file of your Justifications.
                        A "Download PDF" button will also become available on the panel page.
                        In the header of the document there is a "CYCLE-ID-HERE" placeholder. This is for
                        the time allocation committee (TAC) use only, and is replaced upon proposal submission
                        to a particular observing cycle.
                    </Text>
                    <Text size={"sm"}>
                        If the LaTeX compilation fails then the text area will display a list of errors,
                        and optionally warnings, that you will have to fix. These are usually caused by typos
                        in the LaTeX commands used, and/or missing resource files. We recommend you treat warnings
                        as errors. Notice that in this case the "Download PDF" button in the modal will be disabled
                        (greyed-out).
                    </Text>
                    <Text size={"sm"}>
                        Be aware that the "Download PDF" button on the page will be available if a
                        "compiledJustification.pdf" exists in the backend, and that will be the
                        latest <Text span c="blue" inherit>successful</Text> compilation only. If in
                        doubt recompile the Justification, and check the resulting document.
                    </Text>
                </Stack>
            </ScrollArea>
        </Container>
    )
}