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
                    a "simplified" interface to SIMBAD to lookup targets by alternative name,
                    catalogue reference or identity, and populate the
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
                    For 'Alternate Name' and 'Catalogue Reference' search we append a
                    <Text span inherit c={highlightColour}> % </Text>
                    wildcard, which
                    represents zero or more characters, on to your input (with a caveat for the 'Catalogue Reference'
                    search - see it's contextual help).
                </Text>
                <Text size={"sm"}>
                    Notice that some objects may start with a <Text span c={highlightColour}>* </Text>
                    (asterisk) or a <Text span c={highlightColour}>[</Text> (open square brace).
                    Generally, the searches will result in a maximum of 100 objects being displayed in no particular
                    order. To refine the search just input the next character of the target object; bear in mind
                    this could be a space (or two, or three, or ...)
                </Text>
                <Text size={"sm"}>
                    Some names in the SIMBAD database are in fixed-width format, probably a hangover
                    from FORTRAN, and these names will be used, literally, in the
                    <Text span fs={"italic"} inherit> Name </Text>
                    field of the
                    <Text span inherit c={highlightColour}> Target Form</Text>.
                    For example, Messier object 1, 'M 1', will literally be 'M' followed by three
                    spaces (there are a total of 110 Messier objects) then the digit '1'. Of course, you may
                    change the name of the target to whatever you want, within the limits of the form validation,
                    before you save it to the proposal.
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
                        <Text c={"green"} size={"sm"}>
                            Probably the easiest of the searches to get you started.
                        </Text>
                        <Text size={"sm"}>
                            The input is case sensitive i.e., 'Crab' is different to 'crab', and in this case
                            the former will yield results while the latter will not. Notice that there
                            are some targets that start their name with a lowercase letter, or
                            the special characters
                            <Text span c={highlightColour}> * </Text>(asterisk) or
                            <Text span c={highlightColour}> [ </Text>(open square brace). Wildcards are NOT allowed
                            in the Alternate Name search input.
                        </Text>
                        <Text size={"sm"}>
                            When the object is selected, and the
                            <Text span inherit c={highlightColour}> Target Form </Text>
                            populated, you may see a different name displayed than the alternate name used in
                            the search. This is okay. The name in the
                            <Text span inherit c={highlightColour}> Target Form </Text>
                            is the <Text span fs={"italic"} inherit>main_id</Text> from the SIMBAD database that may
                            be referenced by several alternate names. For example,
                            'Crab' is an alternate name for the <Text span fs={"italic"} inherit>main_id</Text> of 'M 1'.
                        </Text>
                    </Stack>

                }
                {
                    props.queryChoice === 'catQuery' &&
                    <Stack>
                        <Text size={"sm"} c={headerColour}>Catalogue reference help</Text>
                        <Text c={"green"} size={"sm"}>
                            If you like playing with search inputs using wildcards (or not) then you'll have a ball.
                        </Text>
                        <Text size={"sm"}>
                            The input is case sensitive and generally will begin with a capitalised
                            letter e.g., <Text span c={highlightColour}>M</Text> for the Messier objects, or
                            the special characters
                            <Text span c={highlightColour}> * </Text>(asterisk) or
                            <Text span c={highlightColour}> [ </Text>(open square brace).
                        </Text>
                        <Text size={"sm"}>
                            As mentioned, some names in the SIMBAD data base are in fixed-width format. As such,
                            you may have to use the ADQL wildcards
                            <Text span inherit c={highlightColour}> % </Text>, representing zero or more characters,
                            and
                            <Text span inherit c={highlightColour}> _ </Text>, representing exactly one character,
                            and/or multiple spaces to find what you want.
                        </Text>
                        <Text size={"sm"}>
                            Be aware that if you do include a
                            wildcard character in the search term we assume that you know the pattern you are
                            looking for and we do not append the
                            <Text span inherit c={highlightColour}> % </Text>
                            wildcard on the search term. For example,
                            if you simply type 'M' the actual search term used is 'M%', but if you type 'M_' then
                            that is the literal search term and, in this case, results in 'Nothing Found' i.e.,
                            there are no targets in the Database with the pattern 'M' followed by a single character.
                        </Text>
                        <Text size={"sm"}>
                            Notice that we have limited the use of the wildcards such that you cannot begin the
                            search string with them but may use them within the string. You may use multiple
                            wildcards within the search term but this may impact on performance. A timeout of 5
                            seconds has been enforced on the search, and if this happens you will have refine
                            your search.
                        </Text>
                    </Stack>
                }
                {
                    props.queryChoice === 'idQuery' &&
                    <Stack>
                        <Text size={"sm"} c={headerColour}>Identity help</Text>
                        <Text c={"green"} size={"sm"}>
                            We recommend that you use the other search functions unless you know exactly the
                            identity of the object you want.
                        </Text>
                        <Text size={"sm"}>
                            This is the least flexible of the search types. You must know the exact identity name
                            of the target you want and the search will only ever return a single search result.
                            Wildcards are NOT allowed in an Identity search.
                        </Text>
                        <Text size={"sm"}>
                            The search is case insensitive and you may include spaces in your search term e.g.,
                            'eagle nebula'. For catalogue references that have a pattern of 'acronym number',
                            you may omit the space. For example, 'M 87' can be found by using 'm87'.
                        </Text>
                    </Stack>
                }
            </Stack>
        </ScrollArea>
    )
}