import {ReactElement} from "react";
import {Divider, ScrollArea, Stack, Text} from "@mantine/core";

export default
function SimbadSearchHelp(props: {queryChoice: string}) : ReactElement {
    const headerColour = "blue"
    const highlightColour = "orange"

    return(
        <ScrollArea h={270} offsetScrollbars type={"hover"} scrollHideDelay={500}>
            <Stack>
                <Text c={"blue"} size={"sm"}>
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
                    a simplified, convenient interface to SIMBAD to lookup targets by alternative name,
                    catalogue reference or identity, and populate the
                    <Text span inherit c={highlightColour}> Target Form </Text>
                    with the corresponding data when an object is selected. Also, the Aladin Sky Atlas viewer
                    will move to the selected target
                </Text>

                <Text size={"sm"}>
                    To trigger a search simply enter the first character of the object you are trying to find.
                    Generally, the searches will result in a maximum of 100 objects being displayed in no particular
                    order. To refine the search just input the next character of the target object; bear in mind
                    this could be a space (or two, or three, or ...)
                </Text>

                <Text size={"sm"}>
                    Some names in the SIMBAD data base are in fixed-width format, a hangover
                    from FORTRAN probably, and these names will be used, literally, in the
                    <Text span fs={"italic"} inherit> Name </Text>
                    field of the
                    <Text span inherit c={highlightColour}> Target Form</Text>.
                    For example, Messier object 1, 'M 1', will literally be 'M' followed by three
                    spaces then the digit '1'. Of course, you may change the name of the target to whatever
                    you want, within the limits of the form validation, before you save it to the proposal.
                </Text>

                <Text size={"sm"}>
                    Contextual help is shown below for the type of query selected by the radio buttons in the
                    <Text span inherit c={highlightColour}> SIMBAD search </Text>section.
                </Text>

                <Divider/>

                {
                    props.queryChoice === 'nameQuery' &&
                    <Stack>
                        <Text size={"sm"} c={headerColour}>Alternate name help</Text>
                        <Text size={"sm"}>
                            The input is case sensitive i.e., 'Crab' is different to 'crab', and in this case the
                            former will yield results while the latter will not.
                        </Text>
                        <Text size={"sm"}>
                            When the object is selected, and the
                            <Text span inherit c={highlightColour}> Target Form </Text>
                            populated, you may see a different name displayed than the alternate name you provided.
                            This is okay. The name in the
                            <Text span inherit c={highlightColour}> Target Form </Text>
                            is the <Text span fs={"italic"} inherit>main_id</Text> from the SIMBAD database and may
                            be referenced by several alternate names. For example,
                            'Crab' is an alternate name for the <Text span fs={"italic"} inherit>main_id</Text> of 'M 1'.
                        </Text>
                    </Stack>

                }
                {
                    props.queryChoice === 'catQuery' &&
                    <Stack>
                        <Text size={"sm"} c={headerColour}>Catalogue reference help</Text>
                        <Text size={"sm"}>
                            The input is case sensitive and generally will begin with a capitalised
                            letter e.g., <Text span c={highlightColour}>M</Text> for the Messier objects. Notice that
                            some catalogue references may start with a <Text span c={highlightColour}>* </Text>
                            (asterisk) or a <Text span c={highlightColour}>[</Text> (open square brace).
                        </Text>
                        <Text size={"sm"}>
                            As mentioned, some names in the SIMBAD data base are in fixed-width format. As such,
                            you may have to use the ADQL wildcards
                            <Text span inherit c={highlightColour}> % </Text>, representing zero or more characters,
                            and
                            <Text span inherit c={highlightColour}> _ </Text>, representing exactly one character,
                            to find what you want. Note that we have limited the use of these wildcards such that
                            you cannot begin the search string with them but may use them within the string.
                        </Text>
                        <Text c={"green"} size={"sm"}>
                            If you like playing with search inputs using wildcards then you'll have a ball.
                        </Text>
                    </Stack>
                }
                {
                    props.queryChoice === 'idQuery' &&
                    'Identity contextual help'
                }
            </Stack>


        </ScrollArea>
    )
}