import {ReactElement} from "react";
import {Anchor, List, ScrollArea, Stack, Tabs, Text} from "@mantine/core";
import {IconAlien, IconGlobe, IconInfoCircle, IconQuestionMark} from "@tabler/icons-react";

export default
function SimbadSearchHelp() : ReactElement {
    const headerColour = "blue"
    const highlightColour = "orange"

    const STACK_PT = 10;
    const SCROLLAREA_HEIGHT = 120;

    return(
        <Tabs allowTabDeactivation variant={"outline"}>
            <Tabs.List grow>
                <Tabs.Tab value={"searchInstructions"} leftSection={<IconInfoCircle/>}>
                    Instructions
                </Tabs.Tab>
                <Tabs.Tab value={"searchTips"} leftSection={<IconQuestionMark />}>
                    Hints and tips
                </Tabs.Tab>
                <Tabs.Tab value={"general"} leftSection={<IconAlien />}>
                    Simbad
                </Tabs.Tab>
                <Tabs.Tab value={"aladin"} leftSection={<IconGlobe />}>
                    Aladin
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value={"general"}>
                <ScrollArea h={SCROLLAREA_HEIGHT} type={"auto"} offsetScrollbars>
                    <Stack pt={STACK_PT}>
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
                            measurements of millions of astronomical objects outside our Solar System. Please visit
                            the SIMBAD <Anchor href={"https://simbad.cds.unistra.fr/simbad/"} target={"_blank"}>site</Anchor> for
                            more information (opens in a new browser tab)
                        </Text>
                    </Stack>
                </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value={"aladin"}>
                <ScrollArea h={SCROLLAREA_HEIGHT} type={"auto"} offsetScrollbars>
                <Stack pt={STACK_PT}>
                    <Text size={"sm"} c={headerColour}>
                        Aladin Sky Atlas
                    </Text>
                    <Text size={"sm"}>
                        Aladin is an interactive sky atlas that visualises digitised astronomical images.
                        More information about the sky atlas can be
                        found <Anchor href={"https://aladin.cds.unistra.fr/"} target={"_blank"}>here</Anchor> (opens
                        in a new browser tab)
                    </Text>

                    <Text size={"sm"}>
                        The Aladin viewer is connected to the form in that you may set the RA and Dec values in the form
                        either by left click dragging the viewer to, or by left clicking on, the desired location. A
                        double left click will also move the reticule to the location under the pointer.
                        The field-of-view may be modified by the mouse wheel, or the scroll operation appropriate
                        to your touchpad
                    </Text>
                    <Text size={"sm"}>
                        If you click on the viewer accidentally you may reset the the Ra and Dec
                        values and the reticule by re-selecting your desired target from the search results list.
                    </Text>
                    <Text size={"sm"}>
                        Notice that you may input Ra and Dec values manually and the viewer will move to that
                        location. However, it is recommended that you use the SIMBAD search facility to find Ra
                        and Dec values.
                    </Text>
                </Stack>
                </ScrollArea>
            </Tabs.Panel>
            <Tabs.Panel value={"searchInstructions"}>
                <ScrollArea h={SCROLLAREA_HEIGHT} type={"auto"} offsetScrollbars>
                <Stack pt={STACK_PT}>
                    <Text size={"sm"} c={headerColour}>
                        How to use SIMBAD search
                    </Text>
                    <Text size={"sm"}>
                        Here we provide
                        a "simplified" interface to SIMBAD to lookup targets by name and populate the
                        <Text span inherit c={highlightColour}> Target Form </Text>
                        with the corresponding data when an object is selected. Also, the Aladin Sky Atlas viewer
                        will move to the selected target.
                    </Text>
                    <Text size={"sm"}>
                        To trigger a search enter at least two characters into the search input.
                        The input is case sensitive with the caveat that SIMBAD special identities are not. Special
                        identities include strings like 'crab', 'm1', 'andromeda', 'eagle nebula', and so on, and
                        they must be written in full to return a result. There appears to be no definitive list of
                        these identities so have a play and maybe you can find them all, but you won't.
                    </Text>
                    <Text size={"sm"}>
                        If a simple search string does not find what you want you may use the ADQL wildcards
                        <Text span inherit c={highlightColour}> % </Text>,
                        representing zero or more characters, and
                        <Text span inherit c={highlightColour}> _ </Text>,
                        representing exactly one character, in your search term, and character case is taken as-is.
                        Notice you may NOT use a
                        wildcard at the START of your search term for performance reasons (the underlying call to
                        the SIMBAD URL is set to abort after 5 seconds, and generally searches that start with a
                        wildcard take longer than that to return).
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
                        of 'M 1'. Of course, you may
                        change the name of the target to whatever you want, within the limits of the form validation,
                        before you save it to the proposal.
                    </Text>
                </Stack>
                </ScrollArea>
            </Tabs.Panel>

            <Tabs.Panel value={"searchTips"}>
                <ScrollArea h={SCROLLAREA_HEIGHT} type={"auto"} offsetScrollbars scrollbars={"y"}>
                <Stack pt={STACK_PT}>
                    <Text size={"sm"} c={headerColour}>
                        Hints and Tips
                    </Text>
                    <List size={"sm"}>
                        <List.Item>Results are ordered alphabetically</List.Item>
                        <List.Item>The maximum number of results returned is 100</List.Item>
                        <List.Item>
                            Proper nouns will probably start with a capitalised first letter e.g. Peacock, Horseshoe
                        </List.Item>
                        <List.Item>
                            Multiple spaces within the search term may produce different results
                            (some SIMBAD names use fixed-width format)
                        </List.Item>
                        <List.Item>
                            You may use the wildcards % and _ within your search term should a simple search not get
                            the result you want.
                        </List.Item>
                        <List.Item c={"orange"}>
                            Sorry, no wildcards at the start of the search term
                        </List.Item>
                        <List.Item>Some objects start with a * or a [</List.Item>
                        <List.Item>
                            Those that start with [ typically have the format [AY] X, where A represents
                            a one to many capitalised character acronym, Y represents a year either two or
                            four digits long,
                            and X is some alphanumeric id. In this case, you will likely need at least 3 characters
                            for the search to yield results.
                        </List.Item>
                        <List.Item>If trying to find Gaia targets use 'Gaia%' as a starting point, simply using
                            'Gaia' will result in a time-out.
                        </List.Item>
                    </List>
                </Stack>
                </ScrollArea>
            </Tabs.Panel>
        </Tabs>
    )
}