import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import {Badge, Box} from "@mantine/core";
import {TextFormats} from "../../generated/proposalToolSchemas.ts";


/**
 * Displays a preview of a justification, either with syntax highlighting or rendered preview
 *
 * @param {TextFormats} format enum of possible formats (asciitext, latex etc.)
 * @param {string} content the actual justification text to be previewed
 * @constructor
 */
export const PreviewJustification = (format: TextFormats, content: string) => {
    switch (format) {
        case 'asciidoc':
            return (<>
                <Badge>{format}</Badge>
                <Box bg={"gray.3"} c={"black"} p={"md"} m={"xs"}>
                    <SyntaxHighlighter language={'asciidoc'}>
                        {content}
                    </SyntaxHighlighter>
                </Box>
            </>);

        case 'latex':
            return (
                <>
                    <Badge>{format}</Badge>
                    <Box bg={"gray.3"} c={"black"} p={"md"} m={"xs"}>
                        {
                            //This is useful for displaying maths stuff but not an entire document
                        }
                        <Latex>
                            {content}
                        </Latex>
                    </Box>
                </>);

        default:
            return (
                <>
                    <Badge>{format}</Badge>
                    <Box bg={"gray.3"} c={"black"} p={"md"} m={"xs"}>
                        <SyntaxHighlighter language={'asciidoc'}>
                            {content}
                        </SyntaxHighlighter>
                    </Box>
                </>);
    }
}
