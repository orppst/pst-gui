/**
 * function to extract the error message string contained in VOTable xml that is returned
 * by SIMBAD when an error occurs.
 */
export default function simbadErrorMessage(voTableXmlString: string) : string {
    if (voTableXmlString.length === 0) return ""; //empty input
    if (voTableXmlString.charAt(0) !== '<') return ""; //not an xml string

    const errorTagHead = '<INFO name="QUERY_STATUS" value="ERROR">'
    const errorTagTail = '</INFO>'

    let errorTagStart = voTableXmlString.indexOf(errorTagHead);
    if (errorTagStart === -1) return ""; //no error tag in the xml string

    const errorTagHeadLen = errorTagHead.length;

    let errorTagEnd = voTableXmlString.indexOf(errorTagTail, errorTagStart + errorTagHeadLen);

    if (errorTagEnd - (errorTagStart + errorTagHeadLen) === 0) return ""; //zero error message length

    return voTableXmlString.substring(errorTagStart + errorTagHeadLen, errorTagEnd);
}