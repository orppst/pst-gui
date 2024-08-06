import {ReactElement} from "react";
import {ScrollArea, Stack, Text} from "@mantine/core";

export default
function SimbadSearchHelp() : ReactElement {
    const headerColour = "blue"
    const highlightColour = "orange"

    return(
        <ScrollArea h={270} offsetScrollbars type={"auto"}>
            <Stack>
                <Text c={headerColour} size={"sm"}>
                    <Text span inherit c={highlightColour}>S</Text>et of
                    <Text span inherit c={highlightColour}> I</Text>dentifications,
                    <Text span inherit c={highlightColour}> M</Text>easurements and
                    <Text span inherit c={highlightColour}> B</Text>ibliography for
                    <Text span inherit c={highlightColour}> A</Text>stronomical
                    <Text span inherit c={highlightColour}> D</Text>ata
                </Text>
                <Text size={"sm"}>
                    SIMBAD provides a dynamical database of basic data, cross-identifications, bibliography and
                    measurements of millions of astronomical objects outside our Solar System. Here we provide
                    a "simplified" interface to SIMBAD to lookup targets by name and populate the
                    <Text span inherit c={highlightColour}> Target Form </Text>
                    with the corresponding data when an object is selected. Also, the Aladin Sky Atlas viewer
                    will move to the selected target.
                </Text>
                <Text size={"sm"}>
                    The Aladin viewer is connected to the form in that you may
                    set the RA and Dec values in the form either by left click dragging the viewer to, or by double
                    clicking on, the desired location. The field-of-view may be modified by the mouse wheel.
                </Text>
                <Text size={"sm"}>
                    To trigger a search simply enter the first character of the object you are trying to find.
                    The input is case insensitive except when using the ADQL wildcards
                    <Text span inherit c={highlightColour}> % </Text>,
                    representing zero or more characters, and
                    <Text span inherit c={highlightColour}> _ </Text>,
                    representing exactly one character, then the input case is taken as is. Notice you may NOT use a
                    wildcard at the START of your search term for performance reasons (the underlying call to
                    the SIMBAD URL times-out after 5 seconds, and generally searches that start with a wildcard
                    take longer than that to return).
                </Text>
                <Text size={"sm"}>
                    Notice that some objects may start with a <Text span c={highlightColour}>* </Text>
                    (asterisk) or a <Text span c={highlightColour}>[</Text> (open square brace).
                    Generally, the searches will result in a maximum of 100 objects being displayed alphabetical order.
                    To refine the search just input the next character of the target object; bear in mind
                    this could be a space.
                </Text>
                <Text size={"sm"}>
                    When the object is selected, and the
                    <Text span inherit c={highlightColour}> Target Form </Text>
                    populated, you may see a different name displayed than the alternate name used in
                    the search. This is okay. The name in the
                    <Text span inherit c={highlightColour}> Target Form </Text>
                    is the <Text span fs={"italic"} inherit>main_id</Text> from the SIMBAD database that may
                    be referenced by several alternate names. For example,
                    'Crab' and 'Crab Nebula' are both alternate names for the
                    <Text span fs={"italic"} inherit> main_id </Text>
                    of 'M 1'.
                </Text>
                <Text size={"sm"}>
                    Some names in the SIMBAD database are in fixed-width format and these names will be used,
                    literally, in the
                    <Text span fs={"italic"} inherit> Name </Text>
                    field of the
                    <Text span inherit c={highlightColour}> Target Form</Text>.
                    For example, Messier object 1, 'M 1', will literally be 'M' followed by three
                    spaces (there are a total of 110 Messier objects) then the digit '1'. Of course, you may
                    change the name of the target to whatever you want, within the limits of the form validation,
                    before you save it to the proposal.
                </Text>
            </Stack>
        </ScrollArea>
    )
}